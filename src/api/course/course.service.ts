import { CategoryRepository } from '@/api/category/repositories/category.repository';
import {
  CourseQuery,
  CourseRes,
  CoursesQuery,
  CreateCourseReq,
  CurriculumRes,
  UpdateCourseReq,
} from '@/api/course';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { InstructorRepository } from '@/api/instructor';
import { JwtPayloadType } from '@/api/token';
import { CursorPaginatedDto, CursorPaginationDto, Nanoid } from '@/common';
import { ErrorCode, Permission } from '@/constants';
import { ForbiddenException, ValidationException } from '@/exceptions';
import { buildPaginator } from '@/utils';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FindOptionsRelations } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly instructorRepository: InstructorRepository,
    // private readonly sectionRepository: SectionRepository,
  ) {}
  async create(public_user_id: Nanoid, dto: CreateCourseReq) {
    const {
      title,
      category: { slug },
    } = dto;
    const category = await this.categoryRepository.findOneBySlug(slug);
    if (!category.parent) throw new ForbiddenException(ErrorCode.E026);
    const instructor =
      await this.instructorRepository.findOneByUserPublicId(public_user_id);

    const course = await this.courseRepository.createCourse({
      title,
      category,
      instructor,
    });

    return course.toDto(CourseRes);
  }

  async findMany(query: CoursesQuery, user?: JwtPayloadType) {
    const queryBuilder = this.courseRepository.createQueryBuilder('course');

    if (query.with_category)
      queryBuilder.leftJoinAndSelect('course.category', 'category');
    if (query.with_instructor)
      queryBuilder.leftJoinAndSelect('course.instructor', 'instructor');

    // **Category Filtering**
    if (query.category_slug) {
      queryBuilder.andWhere('category.slug = :category_slug', {
        category_slug: query.category_slug,
      });
    }

    // if Not provide include_disabled -> return only enabled course. If provide and has permission -> return all
    if (!query.include_disabled)
      queryBuilder.andWhere('course.is_disabled = :is_disabled', {
        is_disabled: false,
      });
    else if (!user?.permissions.includes(Permission.WRITE_COURSE))
      throw new ForbiddenException(ErrorCode.E027);

    // **Level Filtering**
    if (query.level) {
      queryBuilder.andWhere('course.level = :level', { level: query.level });
    }

    if (query.instructor_username) {
      queryBuilder
        .leftJoinAndSelect('course.instructor', 'instructor')
        .leftJoinAndSelect('instructor.user', 'user')
        .andWhere('user.username = :username', {
          username: query.instructor_username,
        });
    }

    const paginator = buildPaginator({
      entity: CourseEntity,
      alias: 'course',
      paginationKeys: ['createdAt'],
      query: {
        limit: query.limit,
        order: 'DESC',
        afterCursor: query.afterCursor,
        beforeCursor: query.beforeCursor,
      },
    });

    const { data, cursor } = await paginator.paginate(queryBuilder);

    const metaDto = new CursorPaginationDto(
      data.length,
      cursor.afterCursor,
      cursor.beforeCursor,
      query,
    );

    return new CursorPaginatedDto(plainToInstance(CourseRes, data), metaDto);
  }

  async findFromUser(user: JwtPayloadType) {
    const courses = await this.courseRepository.find({
      where: { instructor: { user: { id: user.id } } },
      relations: { category: true, instructor: { user: true } },
    });

    return plainToInstance(CourseRes, courses);
  }

  async findOne(id: Nanoid | string, query: CourseQuery): Promise<CourseRes> {
    const load_entities: FindOptionsRelations<CourseEntity> = {};
    if (query.with_instructor) load_entities.instructor = { user: true };
    if (query.with_category) load_entities.category = true;
    const course = await this.courseRepository.findOneByPublicIdOrSlug(
      id,
      load_entities,
    );
    return course.toDto(CourseRes);
  }

  async update(
    id: Nanoid | string,
    user: JwtPayloadType,
    dto: UpdateCourseReq,
  ) {
    const {
      category: { slug: category_slug },
      ...rest
    } = dto;
    const course = await this.courseRepository.findOneByPublicIdOrSlug(id, {
      category: true,
      instructor: { user: true },
    });

    if (
      user.id !== course.instructor.user.id &&
      user.permissions.includes(Permission.WRITE_COURSE)
    )
      throw new ValidationException(ErrorCode.F002);

    if (course.category.slug !== category_slug) {
      const category =
        await this.categoryRepository.findOneBySlug(category_slug);
      if (!category.parent) throw new ForbiddenException(ErrorCode.E017);
      course.category = category;
    }

    Object.assign(course, rest);
    course.updatedBy = user.id;
    await course.save();
    return course.toDto(CourseRes);
  }

  async changeDisableStatus(id_or_slug: Nanoid | string, user: JwtPayloadType) {
    const course = await this.courseRepository.findOneByPublicIdOrSlug(
      id_or_slug,
      {
        instructor: { user: true },
      },
    );

    // ✅ If user has WRITE_COURSE permission (admin), allow
    if (user.permissions.includes(Permission.WRITE_COURSE)) {
      course.is_disabled = !course.is_disabled;
      await course.save();
      return;
    }

    // ✅ If instructor, they must:
    // 1. Be the owner of the course (`user.id === course.instructor.user.id`)
    // 2. The course must not be disabled by admin (`course.updatedBy !== user.id`)
    if (user.id !== course.instructor.user.id) {
      throw new ForbiddenException(ErrorCode.F002); // ❌ User is not the owner
    }

    if (course.updatedBy !== user.id && course.is_disabled) {
      throw new ForbiddenException(ErrorCode.E027); // ❌ Course was disabled by admin
    }

    // ✅ Toggle disable status
    course.is_disabled = !course.is_disabled;
    await course.save();
  }

  async findCurriculums(id_or_slug: Nanoid | string) {
    const course = await this.courseRepository.findOneByPublicIdOrSlug(
      id_or_slug,
      {
        sections: { lectures: true, quizzes: true, articles: true },
      },
      true,
    );

    return course.toDto(CurriculumRes);
  }

  // async upsertCurriculum(
  //   user_id: Nanoid,
  //   id_or_slug: Nanoid | string,
  //   dto: UpsertCurriculumReq,
  // ) {
  //   const course = await this.courseRepository.findOneByPublicIdOrSlug(
  //     id_or_slug,
  //     ['instructor', 'instructor.user'],
  //   );
  //   if (course.instructor.user.id !== user_id)
  //     throw new ForbiddenException(ErrorCode.E029);

  //   const sections = await this.sectionRepository.find({
  //     where: { course_id: course.course_id },
  //     order: { position: 'ASC' },
  //     relations: { items: true },
  //   });

  //   const db_sections_map = new Map(sections.map((s, i) => [s.id, s]));

  //   const min = LexoRank.min();
  //   const max = LexoRank.max();
  //   const positions = min
  //     .multipleBetween(max, sections.length)
  //     .map((p) => p.toString());

  //   const save_sections: SectionEntity[] = [];
  //   const delete_sections: SectionEntity[] = [];
  //   const delete_items: CourseItemEntity[] = [];

  //   dto.sections.forEach((section, i) => {
  //     const db_section = db_sections_map.get(section.id);
  //     if (db_section) {
  //       const { save_items, delete_items: partial } = this.handleItems(
  //         section.items,
  //         db_section.items,
  //       );
  //       const update_section = new SectionEntity({
  //         ...db_section,
  //         items: save_items,
  //         position: positions[i],
  //         title: section.title,
  //       });
  //       save_sections.push(update_section);
  //       delete_items.push(...partial);
  //     } else {
  //       const new_items = this.handleNewItems(section.items);
  //       const new_section = new SectionEntity({
  //         title: section.title,
  //         position: positions[i],
  //         course_id: course.course_id,
  //         items: new_items,
  //       });
  //       save_sections.push(new_section);
  //     }
  //     db_sections_map.delete(section.id);
  //   });

  //   await this.sectionRepository.save(save_sections);

  //   db_sections_map.forEach((section) => {
  //     if (section.items.length) throw new ValidationException(ErrorCode.E031);
  //     delete_sections.push(section);
  //   });

  //   await this.sectionRepository.softRemove(delete_sections);

  //   return plainToInstance(CurriculumRes, {
  //     id: course.id,
  //     sections: save_sections,
  //   });
  // }

  // private handleItems(
  //   input_items: CreateCourseItemReq[],
  //   db_items: CourseItemEntity[],
  // ) {
  //   const db_items_map = new Map(db_items.map((item) => [item.id, item]));
  //   const section_id = db_items[0].section_id;

  //   const min = LexoRank.min();
  //   const max = LexoRank.max();
  //   const positions = min
  //     .multipleBetween(max, db_items.length)
  //     .map((p) => p.toString());

  //   const save_items: CourseItemEntity[] = [];
  //   const delete_items: CourseItemEntity[] = [];

  //   input_items.forEach((item, i) => {
  //     const db_item = db_items_map.get(item.id);
  //     if (db_item) {
  //       db_item.title = item.title;
  //       db_item.position = positions[i];
  //       save_items.push(db_item);
  //     } else {
  //       const new_item = new CourseItemEntity({
  //         title: item.title,
  //         position: positions[i],
  //         section_id: section_id,
  //       });
  //       save_items.push(new_item);
  //     }
  //     db_items_map.delete(item.id);
  //   });

  //   db_items_map.forEach((item) => {
  //     delete_items.push(item);
  //   });

  //   return { save_items, delete_items };
  // }

  // private handleNewItems(
  //   input_items: CreateCourseItemReq[],
  // ): CourseItemEntity[] {
  //   const min = LexoRank.min();
  //   const max = LexoRank.max();
  //   const positions = min
  //     .multipleBetween(max, input_items.length)
  //     .map((p) => p.toString());
  //   return input_items.map((item, i) => {
  //     return new CourseItemEntity({
  //       ...item,
  //       position: positions[i],
  //     });
  //   });
  // }
}
