import { Nanoid, Uuid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CourseReviewRes } from '../dto/review.res.dto';
import { SubmitReviewReq } from '../dto/submit-review.req.dto';
import { CourseEntity } from '../entities/course.entity';
import { EnrolledCourseEntity } from '../entities/enrolled-course.entity';

@Injectable()
export class EnrollCourseService {
  constructor(
    @InjectRepository(EnrolledCourseEntity)
    private readonly enrolledRepo: Repository<EnrolledCourseEntity>,
  ) {}

  async enroll(course_id: Uuid, user_id: Uuid): Promise<void> {
    const enroll_course = this.enrolledRepo.create({
      course_id,
      user_id,
    });
    await this.enrolledRepo.save(enroll_course);
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
  async findEnrolled(ex_user_id: Nanoid): Promise<CourseEntity[]> {
    const enrolled_courses = await this.enrolledRepo.find({
      where: { user: { id: ex_user_id } },
      relations: ['course', 'user'],
    });

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
      relations: ['user', 'course'],
    });

    if (!enrolled) throw new NotFoundException(ErrorCode.E038);

    enrolled.rating = dto.rating;
    enrolled.rating_comment = dto.rating_comment ?? null;

    await this.enrolledRepo.save(enrolled);
    return enrolled.toDto(CourseReviewRes);
  }

  async getCourseReviews(course_id: Nanoid) {
    const reviews = await this.enrolledRepo.find({
      where: { course: { id: course_id } },
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

    const average_rating = avg ? parseFloat(avg) : 0;

    return {
      course_id,
      average_rating: average_rating,
    };
  }
}
