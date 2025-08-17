import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { NotificationType } from '@/api/notification/enum/notification-type.enum';
import { NotificationBuilderService } from '@/api/notification/notification-builder.service';
import { NotificationService } from '@/api/notification/notification.service';
import { UserEntity } from '@/api/user/entities/user.entity';
import {
  Nanoid,
  OffsetPaginatedDto,
  PageOffsetOptionsDto,
  Uuid,
} from '@/common';
import { ErrorCode, Language } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { rawPaginate } from '@/utils/offset-pagination-raw';
import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsNull, Not } from 'typeorm';
import { EnrollUserRes, EnrollUsersRes } from '../dto';
import { CourseReviewRes } from '../dto/review.res.dto';
import { SubmitReviewReq } from '../dto/submit-review.req.dto';
import { CourseEntity } from '../entities/course.entity';
import { EnrolledCourseEntity } from '../entities/enrolled-course.entity';
import { CourseStatus } from '../enums';
import { CourseRepository } from '../repositories/course.repository';
import { EnrolledCourseRepository } from '../repositories/enrolled-course.repository';

@Injectable()
export class EnrollCourseService {
  private logger = new Logger(EnrollCourseService.name);
  constructor(
    private readonly enrolledRepo: EnrolledCourseRepository,
    private readonly lectureRepo: LectureRepository,
    private readonly courseRepo: CourseRepository,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async enroll(course: CourseEntity, user: UserEntity): Promise<void> {
    if (!course) throw new NotFoundException(ErrorCode.E025);

    const enroll_course = this.enrolledRepo.create({
      course_id: course.course_id,
      user_id: user.user_id,
    });

    await this.enrolledRepo.save(enroll_course);

    const notification = await this.notificationService.save(
      user.user_id,
      NotificationType.COURSE_ENROLLED,
      {
        course_id: course.id,
      },
      {
        title: 'Đăng ký khóa học thành công',
        body: `Bạn đã đăng ký thành công khóa học ${course.title}`,
      },
    );
    const built_notification = this.notificationBuilder.courseEnrolled(course);

    this.notificationGateway.emitToUser(user.id, {
      ...notification,
      ...built_notification,
    });
  }

  async unenrollCourse(course_id: Uuid, user_id: Nanoid): Promise<void> {
    if (this.isEnrolled(course_id, user_id)) {
      await this.enrolledRepo.softDelete({
        user: { id: user_id },
        course_id,
      });
    } else {
      throw new ValidationException(ErrorCode.E046);
    }
  }

  async getCertificateCode(user_id: Nanoid, course_id: Uuid) {
    const enrolled = await this.enrolledRepo.findOne({
      where: {
        user: { id: user_id },
        course_id: course_id,
      },
    });
    return enrolled.certificate_code;
  }

  async markCourseCompleted(user_id: Nanoid, course_id: Uuid) {
    let enrolled = await this.enrolledRepo.findOne({
      where: {
        user: { id: user_id },
        course_id: course_id,
      },
      relations: {
        course: true,
        user: true,
      },
    });

    if (!enrolled) {
      throw new NotFoundException(ErrorCode.E038);
    }

    if (!enrolled.is_completed) {
      enrolled.is_completed = true;
      enrolled.completed_at = new Date();

      enrolled = await this.enrolledRepo.save(enrolled);
    }

    const built_notification = this.notificationBuilder.courseCompleted(
      enrolled.course,
    );
    const notification = await this.notificationService.save(
      enrolled.user_id,
      NotificationType.COURSE_COMPLETED,
      {
        course_id: enrolled.course.id,
        certificate_code: enrolled.certificate_code,
      },
      built_notification,
    );

    this.notificationGateway.emitToUser(enrolled.user.id, {
      ...notification,
      ...built_notification,
    });

    return enrolled;
  }

  async getTopRatedCourses(limit: number) {
    return this.enrolledRepo
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.course', 'course')
      .select('course.name', 'name')
      .addSelect('AVG(enrollment.rating)', 'course_avg_rating')
      .where('enrollment.rating IS NOT NULL')
      .groupBy('course.course_id')
      .orderBy('course_avg_rating', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async findEnrolledUsers(course_id: Uuid) {
    const enrolled_courses = await this.enrolledRepo
      .createQueryBuilder('enrolled')
      .leftJoinAndSelect('enrolled.user', 'user')
      .where('enrolled.course_id = :course_id', { course_id })
      .getMany();

    return enrolled_courses.map((enrolled_course) => enrolled_course.user);
  }

  async findUsersWithProgress(
    course_id: Nanoid,
    filter: PageOffsetOptionsDto,
  ): Promise<EnrollUsersRes> {
    const course = await this.courseRepo.findOne({
      where: { id: course_id },
    });
    const total_lectures = await this.lectureRepo.countTotalPublicLectures(
      course.course_id,
    );
    const query_builder = this.enrolledRepo
      .createQueryBuilder('enrolled')
      .leftJoinAndSelect('enrolled.user', 'user')
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .leftJoin('user.lesson_progresses', 'progress')
      .leftJoin('progress.lecture', 'lecture')
      .innerJoin(
        'lecture.section',
        'section',
        'section.course_id = :course_id',
        {
          course_id: course.course_id,
        },
      )
      .innerJoin('lecture.series', 'series', 'series.status = :status', {
        status: CourseStatus.PUBLISHED,
      })
      .where('enrolled.course_id = :course_id', { course_id: course.course_id })
      // .andWhere('progress.completed = true')
      .groupBy(
        'enrolled.user_id, enrolled.course_id, user.user_id, profile_image.media_id, progress.user_lesson_progress_id',
      )
      .addSelect(
        `COUNT(DISTINCT CASE WHEN progress.completed = true THEN progress.user_lesson_progress_id END)`,
        'completed',
      )
      .addSelect('progress');

    const [{ entities, raw }, meta] = await rawPaginate<EnrolledCourseEntity>(
      query_builder,
      filter,
    );

    const data = entities.map((entity, i) => {
      const completed = parseInt(raw[i].completed, 10);
      const progress = Math.round((completed / total_lectures) * 100);
      return {
        ...entity,
        progress: {
          completed,
          progress,
          total: total_lectures,
        },
      };
    });

    return new OffsetPaginatedDto(plainToInstance(EnrollUserRes, data), meta);
  }

  async findEnrolledCourses(ex_user_id: Nanoid): Promise<CourseEntity[]> {
    const enrolled_courses = await this.enrolledRepo
      .createQueryBuilder('enrolled')
      .leftJoinAndSelect('enrolled.course', 'course')
      .leftJoinAndSelect('enrolled.user', 'user')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'instructor_user')
      .leftJoinAndSelect('instructor_user.profile_image', 'profile_image')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'translation',
        'translation.language = :language',
        { language: Language.VI },
      )
      .where('user.id = :id', { id: ex_user_id })
      .addSelect(
        (sub_query) =>
          sub_query
            .select('COUNT(*)')
            .from('enrolled-course', 'ec')
            .where('ec.course_id = course.course_id'),
        'total_enrolled',
      )
      .addSelect(
        (sub_query) =>
          sub_query
            .select('AVG(ec.rating)')
            .from('enrolled-course', 'ec')
            .where('ec.course_id = course.course_id')
            .andWhere('ec.rating IS NOT NULL'),
        'course_avg_rating',
      )
      .getMany();

    return (
      enrolled_courses.map((enrolled_course) => enrolled_course.course) || []
    );
  }

  async getEnrolledCount(course_id: Uuid) {
    const { count } = await this.enrolledRepo
      .createQueryBuilder('enrolled')
      .select('COUNT(*)', 'count')
      .where('enrolled.course_id = :course_id', { course_id })
      .getRawOne<{ count: string }>();

    return { count: count ? parseInt(count) : 0 };
  }

  async isEnrolled(course_id: Uuid, user_id: Nanoid): Promise<boolean> {
    // Check if type of user_id is nanoid, query user first

    const has_enrolled = await this.enrolledRepo.exists({
      where: { course_id, user: { id: user_id } },
      relations: ['user'],
    });
    return has_enrolled;
  }

  async submitOrUpdateReview(
    user_id: Nanoid,
    course_id: Nanoid,
    dto: SubmitReviewReq,
  ) {
    const enrolled = await this.enrolledRepo.findOne({
      where: { user: { id: user_id }, course: { id: course_id } },
      relations: {
        user: true,
        course: { instructor: { user: true } },
      },
    });

    if (!enrolled) throw new NotFoundException(ErrorCode.E038);

    enrolled.rating = dto.rating;
    enrolled.rating_comment = dto.rating_comment ?? null;
    enrolled.reviewed_at = new Date();

    await this.enrolledRepo.save(enrolled);
    this.sendReviewReceivedNotification(enrolled);
    return enrolled.toDto(CourseReviewRes);
  }

  async getCourseReviews(course_id: Nanoid) {
    const reviews = await this.enrolledRepo.find({
      where: {
        course: { id: course_id },
        rating_comment: Not(IsNull()),
      },
      relations: { user: { profile_image: true } },
      order: { createdAt: 'DESC' },
    });

    return plainToInstance(CourseReviewRes, reviews);
  }

  async getMyReview(user_id: Nanoid, course_id: Nanoid) {
    const enrolled = await this.enrolledRepo.findOne({
      where: { user: { id: user_id }, course: { id: course_id } },
      relations: ['user', 'course'],
    });

    if (!enrolled) throw new NotFoundException(ErrorCode.E038);

    return enrolled.toDto(CourseReviewRes);
  }

  async getAverageRating(course_id: Uuid) {
    const { avg } = await this.enrolledRepo
      .createQueryBuilder('enrolled')
      .select('AVG(enrolled.rating)', 'avg')
      .where('enrolled.course_id = :course_id', { course_id })
      .andWhere('enrolled.rating IS NOT NULL')
      .getRawOne<{ avg: string }>();

    const average_rating = avg ? parseFloat(avg) : null;

    return {
      course_id,
      average_rating: average_rating,
    };
  }

  private async sendReviewReceivedNotification(enrolled: EnrolledCourseEntity) {
    const built_notification =
      this.notificationBuilder.courseReviewReceived(enrolled);
    const notification = await this.notificationService.save(
      enrolled.course.instructor.user_id,
      NotificationType.COURSE_REVIEW_RECEIVED,
      {
        course_id: enrolled.course.id,
        user_id: enrolled.user.id,
        username: enrolled.user.username,
      },
      built_notification,
    );
    this.notificationGateway.emitToUser(enrolled.course.instructor.user.id, {
      ...notification,
      ...built_notification,
    });
  }
}
