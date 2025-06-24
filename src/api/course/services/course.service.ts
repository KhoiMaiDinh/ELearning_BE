import { CategoryService } from '@/api/category/category.service';
import { CategoryRepository } from '@/api/category/repositories/category.repository';
import { CouponRepository } from '@/api/coupon/coupon.repository';
import { CouponEntity } from '@/api/coupon/entities/coupon.entity';
import {
  CourseQuery,
  CourseRes,
  CoursesQuery,
  CourseStatus,
  CreateCourseReq,
  CurriculumQuery,
  CurriculumRes,
  PublicCourseReq,
  UpdateCourseReq,
} from '@/api/course';
import { LectureSeriesEntity } from '@/api/course-item/lecture/entities/lecture-series.entity';
import { LectureEntity } from '@/api/course-item/lecture/entities/lecture.entity';
import { LectureSeriesRepository } from '@/api/course-item/lecture/repositories/lecture-series.repository';
import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { ICourseProgress } from '@/api/course-progress/interfaces';
import { LessonProgressService } from '@/api/course-progress/lesson-progress.service';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { InstructorRepository } from '@/api/instructor';
import { NotificationType } from '@/api/notification/enum/notification-type.enum';
import { NotificationBuilderService } from '@/api/notification/notification-builder.service';
import { NotificationService } from '@/api/notification/notification.service';
import { OrderDetailEntity } from '@/api/order/entities/order-detail.entity';
import { PaymentStatus } from '@/api/payment/enums/payment-status.enum';
import { PriceHistoryRepository } from '@/api/price/price-history.repository';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, OffsetPaginatedDto, Uuid } from '@/common';
import {
  ENTITY,
  ErrorCode,
  KafkaTopic,
  Language,
  PERMISSION,
  UploadEntityProperty,
  UploadStatus,
} from '@/constants';
import { ForbiddenException, ValidationException } from '@/exceptions';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { KafkaProducerService } from '@/kafka';
import { MinioClientService } from '@/libs/minio';
import { paginate } from '@/utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { MediaRepository } from '../../media';
import { MediaEntity } from '../../media/entities/media.entity';
import { CourseOrderBy } from '../enums';
import { EnrollCourseService } from './enroll-course.service';
import { FavoriteCourseService } from './favorite-course.service';

@Injectable()
export class CourseService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly courseRepository: CourseRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly instructorRepository: InstructorRepository,
    private readonly priceHistoryRepository: PriceHistoryRepository,
    private readonly sectionRepository: SectionRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly storageService: MinioClientService,
    private readonly categoryService: CategoryService,
    private readonly courseProgressService: LessonProgressService,
    private readonly enrollCourseService: EnrollCourseService,
    private readonly lectureRepository: LectureRepository,
    private readonly producerService: KafkaProducerService,
    private readonly couponRepo: CouponRepository,
    private readonly lectureSeriesRepo: LectureSeriesRepository,
    private readonly favoriteService: FavoriteCourseService,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
  ) {}
  async create(public_user_id: Nanoid, dto: CreateCourseReq) {
    const {
      category: { slug },
      thumbnail: thumbnail_dto,
      ...rest
    } = dto;
    const category = await this.categoryRepository.findOneBySlug(slug);
    if (!category.parent) throw new ForbiddenException(ErrorCode.E026);
    const instructor =
      await this.instructorRepository.findOneByUserPublicId(public_user_id);

    const thumbnail = await this.mediaRepository.findOneById(thumbnail_dto.id);
    this.validateThumbnail(thumbnail);

    const course = this.courseRepository.create({
      ...rest,
      category,
      instructor,
      thumbnail,
    });
    await this.courseRepository.save(course);

    await this.producerService.send(KafkaTopic.COURSE_SAVED, {
      course,
    });
    return course.toDto(CourseRes);
  }

  async findIn(ids: Nanoid[]) {
    if (!ids.length) {
      return [];
    }

    const query_builder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoin('course.enrolled_users', 'enrolled')
      .addSelect(this.getAvgRatingSQL('course'), 'course_avg_rating')
      .loadRelationCountAndMap(
        'course.total_enrolled',
        'course.enrolled_users',
      );
    query_builder.andWhere('course.id IN (:...ids)', { ids });
    query_builder
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .addSelect('user.username', 'username');
    query_builder.leftJoinAndSelect(
      'course.coupons',
      'coupons',
      `coupons.is_active = TRUE
      AND coupons.starts_at <= NOW()
      AND (coupons.expires_at IS NULL OR coupons.expires_at >= NOW())
      AND coupons.is_public = TRUE`,
    );

    const courses = await query_builder.getMany();
    const fallback_coupon = await this.findMostValuablePublicCoupon();
    if (fallback_coupon) {
      for (const course of courses) {
        if (!course.coupons.length) course.coupons.push(fallback_coupon);
      }
    }
    return courses;
  }

  async find(query: CoursesQuery, user?: JwtPayloadType) {
    const query_builder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'translation',
        'translation.language = :language',
        { language: Language.VI },
      )
      .leftJoin('course.enrolled_users', 'enrolled')
      .addSelect(this.getAvgRatingSQL('course'), 'course_avg_rating')
      .loadRelationCountAndMap(
        'course.total_enrolled',
        'course.enrolled_users',
      );

    query_builder.leftJoinAndSelect(
      'course.coupons',
      'coupons',
      `coupons.is_active = TRUE
      AND coupons.starts_at <= NOW()
      AND (coupons.expires_at IS NULL OR coupons.expires_at >= NOW())
      AND coupons.is_public = TRUE`,
    );

    if (query.with_instructor || query.instructor_username) {
      query_builder
        .leftJoinAndSelect('course.instructor', 'instructor')
        .leftJoinAndSelect('instructor.user', 'user')
        .leftJoinAndSelect('user.profile_image', 'profile_image')
        .addSelect('user.username', 'username');
    }

    if (query.q) {
      query_builder.andWhere(
        `to_tsvector('simple', unaccent(coalesce(course.title,'') || ' ' || coalesce(course.subtitle,'') || ' ' || coalesce(course.description,''))) @@ plainto_tsquery('simple', unaccent(:q))`,
        { q: query.q },
      );
    }

    // **Category Filtering**
    if (query.category_slug) {
      query_builder.andWhere('category.slug = :category_slug', {
        category_slug: query.category_slug,
      });
    }

    if (query.min_rating) {
      query_builder.andWhere(
        `${this.getAvgRatingSQL('course')} >= :min_rating`,
        {
          min_rating: query.min_rating,
        },
      );
    }

    // if Not provide include_disabled -> return only enabled course. If provide and has permission -> return all
    if (!query.include_disabled)
      query_builder.andWhere('course.status = :status', {
        status: CourseStatus.PUBLISHED,
      });
    else if (!user?.permissions.includes(PERMISSION.READ_COURSE))
      throw new ForbiddenException(ErrorCode.E028);

    // **Level Filtering**
    if (query.level) {
      query_builder.andWhere('course.level = :level', { level: query.level });
    }

    if (query.instructor_username) {
      query_builder.andWhere('user.username = :username', {
        username: query.instructor_username,
      });
    }

    if (query.min_price > 0) {
      query_builder.andWhere('course.price >= :min_price', {
        min_price: query.min_price,
      });
    }

    if (query.max_price) {
      query_builder.andWhere('course.price <= :max_price', {
        max_price: query.max_price,
      });
    }

    if (query.order_by) {
      switch (query.order_by) {
        case CourseOrderBy.RATING:
          query_builder.orderBy('course_avg_rating', query.order);
          break;
        case CourseOrderBy.PRICE:
          query_builder.orderBy('course.price', query.order);
          break;
        case CourseOrderBy.NAME:
          query_builder.orderBy('course.title', query.order);
          break;
        case CourseOrderBy.STUDENT_COUNT:
          query_builder.orderBy('course.total_enrolled', query.order);
          break;
        case CourseOrderBy.CREATED_AT:
          query_builder.orderBy('course.createdAt', query.order);
          break;
        default:
          query_builder.orderBy('course.createdAt', query.order);
          break;
      }
    } else {
      query_builder.orderBy('course.createdAt', query.order);
    }

    const [courses, metaDto] = await paginate<CourseEntity>(
      query_builder,
      query,
      {
        skipCount: false,
        takeAll: false,
      },
    );

    const fallback_coupon = await this.findMostValuablePublicCoupon();
    if (fallback_coupon) {
      for (const course of courses) {
        if (!course.coupons.length) course.coupons.push(fallback_coupon);
      }
    }

    return new OffsetPaginatedDto(plainToInstance(CourseRes, courses), metaDto);
  }

  async findFromUser(user: JwtPayloadType) {
    const query_builder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect(
        'category.translations',
        'translation',
        'translation.language = :language',
        { language: Language.VI },
      )
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('user.profile_image', 'profile_image')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoin('course.enrolled_users', 'enrolled')
      .addSelect(this.getAvgRatingSQL('course'), 'course_avg_rating')
      .loadRelationCountAndMap('course.total_enrolled', 'course.enrolled_users')
      .leftJoin(
        (qb) =>
          qb
            .select('od.course_id', 'course_id')
            .addSelect('SUM(od.final_price)', 'total_revenue')
            .from(OrderDetailEntity, 'od')
            .innerJoin('od.order', 'o')
            .where('o.payment_status IN (:...status)', {
              status: [PaymentStatus.SUCCESS],
            })
            .groupBy('od.course_id'),
        'revenue',
        'revenue.course_id = course.course_id',
      )
      .addSelect('COALESCE(revenue.total_revenue, 0)', 'course_total_revenue')
      .where('user.id = :user_id', { user_id: user.id });

    const courses = await query_builder.getMany();

    return plainToInstance(CourseRes, courses);
  }

  async findOne(
    id_or_slug: Nanoid | string,
    query: CourseQuery = {},
  ): Promise<CourseEntity> {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      .where('course.id = :id_or_slug OR course.slug = :id_or_slug', {
        id_or_slug,
      });

    if (query.with_sections) {
      qb.leftJoinAndSelect(
        'course.sections',
        'sections',
        'sections.status = :status',
        { status: CourseStatus.PUBLISHED },
      )
        .leftJoinAndSelect('sections.lectures', 'lectures')
        .leftJoinAndSelect('lectures.series', 'series')
        .leftJoinAndSelect('series.video', 'video')
        .leftJoinAndSelect('series.resources', 'resources')
        .leftJoinAndSelect('resources.resource_file', 'resource_file')
        .leftJoinAndSelect('sections.quizzes', 'quizzes')
        .leftJoinAndSelect('sections.articles', 'articles');
    }

    if (query.with_category) {
      qb.leftJoinAndSelect('course.category', 'category')
        .leftJoinAndSelect('category.translations', 'category_translations')
        .leftJoinAndSelect('category.parent', 'parent')
        .leftJoinAndSelect('parent.translations', 'parent_translations');
    }

    if (query.with_thumbnail) {
      qb.leftJoinAndSelect('course.thumbnail', 'thumbnail');
    }

    qb.leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'instructor_user')
      .leftJoinAndSelect('instructor_user.profile_image', 'profile_image');

    const course = await qb.getOne();

    if (!course) throw new NotFoundException(ErrorCode.E025);

    for (const section of course.sections ?? []) {
      for (const lecture of section.lectures ?? []) {
        const latestPublishedSeries = lecture.latestPublishedSeries;
        if (lecture.is_preview) {
          latestPublishedSeries.video =
            await this.storageService.getPresignedUrl(
              latestPublishedSeries.video,
            );
        } else {
          latestPublishedSeries.video = null;
        }
        lecture.series = [latestPublishedSeries];
      }
    }

    const rating_result = await this.enrollCourseService.getAverageRating(
      course.course_id,
    );
    course.avg_rating = rating_result.average_rating ?? 0;

    const enrolled_count_result =
      await this.enrollCourseService.getEnrolledCount(course.course_id);
    course.total_enrolled = enrolled_count_result.count ?? 0;

    if (query?.with_thumbnail && course.thumbnail) {
      course.thumbnail = await this.storageService.getPresignedUrl(
        course.thumbnail,
      );
    }

    if (query?.with_category && course.category) {
      this.categoryService.filterTranslations(course.category, Language.VI);
    }

    return course;
  }

  async update(
    id: Nanoid | string,
    user: JwtPayloadType,
    dto: UpdateCourseReq,
  ) {
    const {
      category: category_dto,
      price,
      thumbnail: thumbnail_dto,
      ...rest
    } = dto;
    const course = await this.courseRepository.findOneByPublicIdOrSlug(id, {
      category: true,
      instructor: { user: true },
      thumbnail: true,
    });

    if (
      user.id !== course.instructor.user.id &&
      user.permissions.includes(PERMISSION.WRITE_COURSE)
    )
      throw new ValidationException(ErrorCode.F002);

    if (
      category_dto != undefined &&
      course.category.slug !== category_dto.slug
    ) {
      const category = await this.categoryRepository.findOneBySlug(
        category_dto.slug,
      );
      if (!category.parent) throw new ForbiddenException(ErrorCode.E017);
      course.category = category;
    }
    if (
      thumbnail_dto != undefined &&
      thumbnail_dto.id !== course.thumbnail.id
    ) {
      const thumbnail = await this.mediaRepository.findOneById(
        thumbnail_dto.id,
      );
      this.validateThumbnail(thumbnail);
      course.thumbnail = thumbnail;
    }

    if (price !== undefined && price != course.price) {
      const course_price_history = this.priceHistoryRepository.create({
        course,
        new_price: price,
        old_price: course.price,
      });
      await this.priceHistoryRepository.insert(course_price_history);
      course.price = price;
    }

    Object.assign(course, rest);
    course.updatedBy = user.id;
    await course.save();

    await this.producerService.send(KafkaTopic.COURSE_SAVED, {
      course,
    });
    return course.toDto(CourseRes);
  }

  async publish(
    id_or_slug: Nanoid | string,
    user: JwtPayloadType,
    dto: PublicCourseReq,
  ) {
    const course = await this.courseRepository.findOneByPublicIdOrSlug(
      id_or_slug,
      {
        instructor: { user: true },
        sections: {
          lectures: { series: { video: true } },
          quizzes: true,
          articles: true,
        },
      },
      true,
    );

    // ✅ If user has WRITE_COURSE permission (admin), allow

    if (user.permissions.includes(PERMISSION.WRITE_COURSE)) {
      course.status = dto.status;
      await course.save();
      return;
    }

    this.ensureOwnership(course, user.id);

    if (dto.status === CourseStatus.BANNED) {
      throw new ForbiddenException(
        ErrorCode.E027,
        'Giảng viên không thể vô hiệu hóa khóa học',
      );
    }

    const to_public_series: LectureSeriesEntity[] = [];
    const to_update_lectures: LectureEntity[] = [];
    if (dto.status === CourseStatus.PUBLISHED) {
      if (!course.sections.length) {
        throw new ValidationException(
          ErrorCode.E043,
          'Không thể xuất bản: Khóa học chưa có nội dung',
        );
      }

      const banned_lecture_titles: string[] = [];

      course.sections.forEach((section) => {
        section.lectures.forEach((lecture) => {
          const sorted = lecture.series.sort((a, b) => b.version - a.version);
          const latest = sorted[0];
          if (latest.status === CourseStatus.BANNED) {
            banned_lecture_titles.push(
              `"<strong>${lecture.title}</strong>" (Chương: <strong>${section.title}</strong>)`,
            );
          }
        });
      });

      if (banned_lecture_titles.length > 0) {
        throw new ValidationException(
          ErrorCode.E043,
          `Không thể xuất bản: Các bài giảng sau vi phạm chính sách và cần được cập nhật: ${banned_lecture_titles.join(', ')}.`,
        );
      }

      const has_unpublished_draft = course.sections.some((section) =>
        section.lectures.some((lecture) =>
          lecture.series.some((series) => series.status === CourseStatus.DRAFT),
        ),
      );

      const has_deletion_changes = course.sections.some((section) =>
        section.lectures.some(
          (lecture) =>
            (lecture.deletedAt == null && lecture.is_hidden == true) ||
            (lecture.deletedAt !== null && lecture.is_hidden == false),
        ),
      );

      if (!has_unpublished_draft && !has_deletion_changes) {
        throw new ValidationException(
          ErrorCode.E043,
          'Không có thay đổi nào mới để xuất bản. Vui lòng cập nhật bài giảng trước khi xuất bản.',
        );
      }

      course.sections.forEach((section) => {
        section.lectures.forEach((lecture) => {
          const was_deleted = lecture.deletedAt !== null;
          const is_now_hidden = lecture.is_hidden;

          if (!was_deleted && is_now_hidden) {
            lecture.deletedAt = new Date();
            to_update_lectures.push(lecture);
          }

          if (was_deleted && !is_now_hidden) {
            lecture.deletedAt = null;
            to_update_lectures.push(lecture);
          }
        });
      });

      course.sections.forEach((section) => {
        if (section.items.length === 0) {
          throw new ValidationException(
            ErrorCode.E043,
            `Không thể xuất bản: Nội dung Chương <strong>${section.title}</strong> trống`,
          );
        }
        section.lectures.forEach((lecture) => {
          if (lecture.is_hidden) {
            return;
          }

          const latest_series = lecture.series.sort(
            (a, b) => b.version - a.version,
          )[0];
          console.log(latest_series);
          if (
            !latest_series ||
            latest_series.video.status !== UploadStatus.VALIDATED
          ) {
            throw new ValidationException(
              ErrorCode.E043,
              `Không thể xuất bản: Video bài giảng "${latest_series.title}" trong chương "${section.title}" chưa sẵn sàng để xuất bản`,
            );
          }
          latest_series.status = CourseStatus.PUBLISHED;
          to_public_series.push(latest_series);
        });
        section.status = CourseStatus.PUBLISHED;
      });
      if (to_public_series.length) course.published_at = new Date();
    }

    await this.lectureRepository.save(to_update_lectures);
    await this.lectureSeriesRepo.save(to_public_series);
    await this.sectionRepository.save(course.sections);
    if (course.status === CourseStatus.BANNED) {
      course.status = CourseStatus.BANNED;
    } else course.status = dto.status;
    if (course.status === CourseStatus.PUBLISHED) {
      await this.sendPublishedNotification(course);
    }
    await course.save();
    return course.toDto(CourseRes);
  }

  private async sendPublishedNotification(course: CourseEntity) {
    const enrolled_users = await this.enrollCourseService.findEnrolledUsers(
      course.course_id,
    );
    const built_notification = this.notificationBuilder.courseUpdated(course);
    for (const user of enrolled_users) {
      const notification = await this.notificationService.save(
        user.user_id,
        NotificationType.COURSE_UPDATED,
        {
          course_id: course.id,
        },
        built_notification,
      );
      this.notificationGateway.emitToUser(user.id, {
        ...notification,
        ...built_notification,
      });
    }
  }

  async findCurriculums(
    user_payload: JwtPayloadType,
    id_or_slug: Nanoid | string,
    filter: CurriculumQuery,
  ) {
    let is_enrolled: boolean;
    const user = await this.userRepository.findOneByPublicId(user_payload.id);

    const query_builder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('course.sections', 'sections')
      .leftJoinAndSelect('course.warnings', 'warnings')
      .leftJoinAndSelect('warnings.report', 'report');

    if (filter.include_deleted_lectures) {
      query_builder
        .withDeleted()
        .leftJoinAndSelect('sections.lectures', 'lectures');
    } else {
      query_builder
        .leftJoinAndSelect(
          'sections.lectures',
          'lectures',
          filter.is_show_hidden
            ? '(lectures.deleted_at IS NULL OR (lectures.deleted_at IS NOT NULL AND lectures.is_hidden = false))'
            : 'lectures.deleted_at IS NULL',
        )
        .withDeleted();
    }

    query_builder
      .leftJoinAndSelect('lectures.series', 'series')
      .orderBy('series.version', 'DESC')
      .leftJoinAndSelect('series.video', 'video')
      .leftJoinAndSelect('series.resources', 'resources')
      .leftJoinAndSelect('resources.resource_file', 'resource_file')
      .leftJoinAndSelect(
        'lectures.progresses',
        'progress',
        'progress.user_id = :user_id',
        { user_id: user.user_id },
      )
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('category.translations', 'category_translations')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('parent.translations', 'parent_translations')
      .where('course.id = :id', { id: id_or_slug })
      .orWhere('course.slug = :slug', { slug: id_or_slug });

    const course = await query_builder.getOne();

    if (!course) throw new NotFoundException(ErrorCode.E025);
    if (
      user_payload.id !== course.instructor.user.id &&
      !user_payload.permissions.includes(PERMISSION.READ_COURSE)
    ) {
      is_enrolled = await this.enrollCourseService.isEnrolled(
        course.course_id,
        user_payload.id,
      );
      if (!is_enrolled) throw new ValidationException(ErrorCode.F002);
      else {
        await this.courseProgressService.attachToLectures(
          course,
          user_payload.id,
        );
      }
    }

    // get selected language for category
    this.categoryService.filterTranslations(course.category, Language.VI);

    await Promise.all(
      course.sections.map(async (section) => {
        await Promise.all(
          section.lectures.map(async (lecture) => {
            await Promise.all(
              lecture.series.map(async (series) => {
                this.addVideoExtension(series.video);
                series.video = await this.storageService.getPresignedUrl(
                  series.video,
                );
                await Promise.all(
                  series.resources.map(async (resource) => {
                    resource.resource_file =
                      await this.storageService.getPresignedUrl(
                        resource.resource_file,
                      );
                  }),
                );
              }),
            );
          }),
        );
      }),
    );

    const enrolledCountResult = await this.enrollCourseService.getEnrolledCount(
      course.course_id,
    );
    course.total_enrolled = enrolledCountResult.count ?? 0;

    const result = await this.enrollCourseService.getAverageRating(
      course.course_id,
    );
    course.avg_rating = result.average_rating;

    const is_favorite = await this.favoriteService.hasFavorited(
      user.user_id,
      course.course_id,
    );
    course.is_favorite = is_favorite;

    let course_progress: ICourseProgress;
    if (is_enrolled) {
      course_progress = await this.courseProgressService.getCourseProgress(
        user_payload.id,
        course.course_id,
      );
    }

    return { course, course_progress };
  }

  async findEnrolled(user_id: Nanoid): Promise<CourseRes[]> {
    const enrolled_courses =
      await this.enrollCourseService.findEnrolledCourses(user_id);

    const res = await Promise.all(
      enrolled_courses.map(async (enrolled_course) => {
        const course_progress =
          await this.courseProgressService.getCourseProgress(
            user_id,
            enrolled_course.course_id,
          );

        const result = await this.enrollCourseService.getAverageRating(
          enrolled_course.course_id,
        );
        (enrolled_course as any).rating = result.average_rating;
        const res = enrolled_course.toDto(CurriculumRes);
        res.course_progress = course_progress;
        return res;
      }),
    );

    return res;
  }

  ensureOwnership(course: CourseEntity, user_id: Nanoid): void {
    if (user_id !== course.instructor.user.id) {
      throw new ForbiddenException(
        ErrorCode.F002,
        'User is not the owner of the course',
      );
    }
  }

  private validateThumbnail(thumbnail: MediaEntity) {
    if (!thumbnail) throw new NotFoundException(ErrorCode.E019);
    if (
      thumbnail.status != UploadStatus.VALIDATED &&
      thumbnail.status != UploadStatus.UPLOADED
    )
      throw new ValidationException(ErrorCode.E042);
    if (
      thumbnail.entity != ENTITY.COURSE &&
      thumbnail.entity_property != UploadEntityProperty.THUMBNAIL
    )
      throw new ValidationException(ErrorCode.E034);
  }

  private addVideoExtension(video: MediaEntity) {
    if (video.status != UploadStatus.VALIDATED) return video;
    if (!video.key.endsWith('.m3u8')) {
      video.key += '/master.m3u8';
    }
    return video;
  }

  async republishManyByInstructor(user_id: Uuid) {
    await this.courseRepository.update(
      {
        instructor: { user: { user_id: user_id } },
        status: CourseStatus.ARCHIVED,
      },
      { status: CourseStatus.PUBLISHED },
    );
  }
  async unpublishManyByInstructor(user_id: Uuid) {
    await this.courseRepository.update(
      {
        instructor: { user: { user_id: user_id } },
        status: CourseStatus.PUBLISHED,
      },
      { status: CourseStatus.ARCHIVED },
    );
  }

  getAvgRatingSQL(alias: string) {
    return `(SELECT AVG(enrolled.rating)
              FROM "enrolled-course" enrolled
              WHERE enrolled.course_id = ${alias}.course_id
                AND enrolled.rating IS NOT NULL)`;
  }

  async unban(course_id: Nanoid) {
    await this.courseRepository.update(
      { id: course_id },
      { status: CourseStatus.PUBLISHED },
    );
  }

  private async findMostValuablePublicCoupon(): Promise<CouponEntity> {
    const coupon = await this.couponRepo
      .createQueryBuilder('coupon')
      .where('coupon.is_public = TRUE')
      .andWhere('coupon.course_id IS NULL')
      .andWhere('coupon.is_active = TRUE')
      .andWhere('coupon.starts_at <= NOW()')
      .andWhere('(coupon.expires_at IS NULL OR coupon.expires_at >= NOW())')
      .orderBy('coupon.value', 'DESC')
      .getOne();

    return coupon;
  }
}
