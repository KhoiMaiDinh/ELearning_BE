import { CategoryService } from '@/api/category/category.service';
import { CategoryRepository } from '@/api/category/repositories/category.repository';
import {
  CourseQuery,
  CourseRes,
  CoursesQuery,
  CourseStatus,
  CreateCourseReq,
  CurriculumRes,
  PublicCourseReq,
  UpdateCourseReq,
} from '@/api/course';
import { LectureRepository } from '@/api/course-item/lecture/lecture.repository';
import { LessonProgressService } from '@/api/course-progress/lesson-progress.service';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { InstructorRepository } from '@/api/instructor';
import { PriceHistoryRepository } from '@/api/price/price-history.repository';
import { SectionRepository } from '@/api/section/section.repository';
import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid, OffsetPaginatedDto, Uuid } from '@/common';
import {
  Entity,
  ErrorCode,
  KafkaTopic,
  Language,
  Permission,
  UploadEntityProperty,
  UploadStatus,
} from '@/constants';
import { ForbiddenException, ValidationException } from '@/exceptions';
import { KafkaProducerService } from '@/kafka';
import { MinioClientService } from '@/libs/minio';
import { paginate } from '@/utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindOptionsRelations } from 'typeorm';
import { MediaRepository } from '../../media';
import { MediaEntity } from '../../media/entities/media.entity';
import { EnrollCourseService } from './enroll-course.service';

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
    this.isValidThumbnail(thumbnail);

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

  async find(query: CoursesQuery, user?: JwtPayloadType) {
    const query_builder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoin('course.enrolled_users', 'enrolled')
      .addSelect(this.getAvgRatingSQL('course'), 'course_avg_rating')
      .loadRelationCountAndMap(
        'course.total_enrolled',
        'course.enrolled_users',
      );

    if (query.with_category || query.category_slug)
      query_builder.leftJoinAndSelect('course.category', 'category');
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
    else if (!user?.permissions.includes(Permission.READ_COURSE))
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

    const [courses, metaDto] = await paginate<CourseEntity>(
      query_builder,
      query,
      {
        skipCount: false,
        takeAll: false,
      },
    );

    return new OffsetPaginatedDto(plainToInstance(CourseRes, courses), metaDto);
  }

  async findFromUser(user: JwtPayloadType) {
    const query_builder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoin('course.enrolled_users', 'enrolled')
      .addSelect(this.getAvgRatingSQL('course'), 'course_avg_rating')
      .loadRelationCountAndMap('course.total_enrolled', 'course.enrolled_users')
      .where('user.id = :user_id', { user_id: user.id });

    const courses = await query_builder.getMany();

    return plainToInstance(CourseRes, courses);
  }

  async findOne(
    id_or_slug: Nanoid | string,
    query: CourseQuery = {},
  ): Promise<CourseEntity> {
    const load_entities: FindOptionsRelations<CourseEntity> = {};
    load_entities.instructor = { user: true };

    if (query?.with_sections)
      load_entities.sections = {
        lectures: true,
        quizzes: true,
        articles: true,
      };
    if (query?.with_category)
      load_entities.category = {
        translations: true,
        parent: { translations: true },
      };
    if (query?.with_thumbnail) load_entities.thumbnail = true;

    const course = await this.courseRepository.findOne({
      where: [{ id: id_or_slug as Nanoid }, { slug: id_or_slug }],
      relations: load_entities,
    });

    if (!course) throw new NotFoundException(ErrorCode.E025);

    const rating_result = await this.enrollCourseService.getAverageRating(
      course.course_id,
    );
    course.avg_rating = rating_result.average_rating ?? 0;

    const enrolledCountResult = await this.enrollCourseService.getEnrolledCount(
      course.course_id,
    );
    course.total_enrolled = enrolledCountResult.count ?? 0;

    if (query?.with_thumbnail && course.thumbnail)
      course.thumbnail = await this.storageService.getPresignedUrl(
        course.thumbnail,
      );

    if (query?.with_category && course.category)
      this.categoryService.filterTranslations(course.category, Language.VI);

    return course;
  }

  async update(
    id: Nanoid | string,
    user: JwtPayloadType,
    dto: UpdateCourseReq,
  ) {
    const { category: category_dto, price, ...rest } = dto;
    const course = await this.courseRepository.findOneByPublicIdOrSlug(id, {
      category: true,
      instructor: { user: true },
    });

    if (
      user.id !== course.instructor.user.id &&
      user.permissions.includes(Permission.WRITE_COURSE)
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

  async changeStatus(
    id_or_slug: Nanoid | string,
    user: JwtPayloadType,
    dto: PublicCourseReq,
  ) {
    const course = await this.courseRepository.findOneByPublicIdOrSlug(
      id_or_slug,
      {
        instructor: { user: true },
        sections: {
          lectures: { videos: { video: true } },
          quizzes: true,
          articles: true,
        },
      },
    );

    // ✅ If user has WRITE_COURSE permission (admin), allow
    if (user.permissions.includes(Permission.WRITE_COURSE)) {
      course.status = dto.status;
      await course.save();
      return;
    }

    // ✅ If instructor, they must:
    // 1. Be the owner of the course (`user.id === course.instructor.user.id`)
    // 2. The course must not be disabled by admin (`course.updatedBy !== user.id`)
    this.ensureOwnership(course, user.id);

    if (course.status === CourseStatus.BANNED) {
      throw new ForbiddenException(ErrorCode.E027); // ❌ Course was disabled by admin
    }

    if (dto.status === CourseStatus.BANNED) {
      throw new ForbiddenException(
        ErrorCode.E027,
        'Instructor cannot disable a course',
      );
    }

    if (dto.status === CourseStatus.PUBLISHED) {
      // check course quality
      if (!course.sections.length) {
        throw new ForbiddenException(
          ErrorCode.E043,
          'Invalid Publication: Empty Course Content',
        );
      }
      course.sections.forEach((section) => {
        if (section.items.length === 0) {
          throw new ForbiddenException(
            ErrorCode.E043,
            'Invalid Publication: Empty Section Content',
          );
        }
        section.lectures.forEach((lecture) => {
          if (
            lecture.videos?.length === 0 ||
            lecture.video.video.status !== UploadStatus.VALIDATED
          ) {
            throw new ForbiddenException(
              ErrorCode.E043,
              `Invalid Publication: Lecture's video is not ready`,
            );
          }
          lecture.status = dto.status;
        });
        section.status = dto.status;
      });
    }

    // ✅ Toggle disable status
    await this.sectionRepository.save(course.sections);
    course.status = dto.status;
    await course.save();
    return course.toDto(CourseRes);
  }

  async findCurriculums(
    user_payload: JwtPayloadType,
    id_or_slug: Nanoid | string,
  ) {
    let is_enrolled: boolean;
    const course = await this.courseRepository.findOne({
      where: [{ id: id_or_slug as Nanoid }, { slug: id_or_slug }],
      relations: {
        thumbnail: true,
        instructor: { user: true },
        sections: {
          lectures: {
            videos: { video: true },
            resources: { resource_file: true },
            progresses: true,
          },
          quizzes: true,
          articles: true,
        },
        category: {
          translations: true,
          parent: { translations: true },
        },
      },
    });

    if (!course) throw new NotFoundException(ErrorCode.E025);
    if (
      user_payload.id !== course.instructor.user.id &&
      !user_payload.permissions.includes(Permission.READ_COURSE)
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

    // get thumbnail access
    course.thumbnail = await this.storageService.getPresignedUrl(
      course.thumbnail,
    );

    // get selected language for category
    this.categoryService.filterTranslations(course.category, Language.VI);

    await Promise.all(
      course.sections.map(async (section) => {
        await Promise.all(
          section.lectures.map(async (lecture) => {
            await Promise.all(
              lecture.videos.map(async (video) => {
                this.addVideoExtension(video.video);
                video.video = await this.storageService.getPresignedUrl(
                  video.video,
                );
              }),
            );

            await Promise.all(
              lecture.resources.map(async (resource) => {
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

    const enrolledCountResult = await this.enrollCourseService.getEnrolledCount(
      course.course_id,
    );
    course.total_enrolled = enrolledCountResult.count ?? 0;

    const result = await this.enrollCourseService.getAverageRating(
      course.course_id,
    );
    course.avg_rating = result.average_rating;

    const res = course.toDto(CurriculumRes);
    if (is_enrolled) {
      const course_progress =
        await this.courseProgressService.getCourseProgress(
          user_payload.id,
          course.course_id,
        );
      res.course_progress = course_progress;
    }

    return res;
  }

  async findEnrolled(user_id: Nanoid): Promise<CourseRes[]> {
    const enrolled_courses =
      await this.enrollCourseService.findEnrolled(user_id);

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

  private isValidThumbnail(thumbnail: MediaEntity) {
    if (!thumbnail) throw new NotFoundException(ErrorCode.E019);
    if (
      thumbnail.status != UploadStatus.VALIDATED &&
      thumbnail.status != UploadStatus.UPLOADED
    )
      throw new ValidationException(ErrorCode.E042);
    if (
      thumbnail.entity != Entity.COURSE &&
      thumbnail.entity_property != UploadEntityProperty.THUMBNAIL
    )
      throw new ValidationException(ErrorCode.E034);
  }

  private addVideoExtension(video: MediaEntity) {
    if (video.status != UploadStatus.VALIDATED) return video;
    video.key += '/master.m3u8';
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
    await this.lectureRepository.update(
      { section: { course: { id: course_id } }, status: CourseStatus.BANNED },
      { status: CourseStatus.PUBLISHED },
    );
  }
}
