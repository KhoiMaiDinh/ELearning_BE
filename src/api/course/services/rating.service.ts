import { InstructorRepository } from '@/api/instructor';
import { JwtPayloadType } from '@/api/token';
import { CursorPaginationDto, Uuid } from '@/common';
import { buildPaginator } from '@/utils';
import { Injectable } from '@nestjs/common';
import { CursorPaginateRatingQuery, RatingQuery } from '../dto/';
import { EnrolledCourseEntity } from '../entities/enrolled-course.entity';
import { RatingOrderBy } from '../enums';
import { EnrolledCourseRepository } from '../repositories/enrolled-course.repository';

@Injectable()
export class RatingService {
  constructor(
    private readonly enrolledRepo: EnrolledCourseRepository,
    private readonly instructorRepo: InstructorRepository,
  ) {}

  async getInstructorRating(
    user: JwtPayloadType,
    filter: CursorPaginateRatingQuery,
  ) {
    const instructor = await this.instructorRepo.findOneByUserPublicId(user.id);
    const { ratings, metaDto } = await this.find(filter, {
      instructor_id: instructor.instructor_id,
    });

    return { ratings, metaDto };
  }

  async find(
    filter: RatingQuery | CursorPaginateRatingQuery,
    options: { instructor_id: Uuid },
  ) {
    const query_builder = this.enrolledRepo.createQueryBuilder('enrolled');

    query_builder
      .leftJoinAndSelect('enrolled.course', 'course')
      .leftJoinAndSelect('enrolled.user', 'user')
      .leftJoinAndSelect('course.thumbnail', 'thumbnail')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user_profile')
      .leftJoinAndSelect('user.profile_image', 'profile_image');

    query_builder.andWhere('enrolled.rating IS NOT NULL');

    if (filter.rating != undefined) {
      query_builder.andWhere('enrolled.rating =:rating', {
        rating: filter.rating,
      });
    }

    if (options.instructor_id) {
      query_builder.andWhere('instructor.instructor_id = :instructor_id', {
        instructor_id: options.instructor_id,
      });
    }

    if (filter instanceof CursorPaginateRatingQuery) {
      const paginator = buildPaginator({
        entity: EnrolledCourseEntity,
        alias: 'enrolled',
        paginationKeys: [
          filter.order_by == RatingOrderBy.RATING ? 'rating' : 'createdAt',
        ],
        query: {
          limit: filter.limit,
          order: filter.order,
          afterCursor: filter.afterCursor,
          beforeCursor: filter.beforeCursor,
        },
      });

      const { data: ratings, cursor } = await paginator.paginate(query_builder);

      const metaDto = new CursorPaginationDto(
        ratings.length,
        cursor.afterCursor,
        cursor.beforeCursor,
        filter,
      );

      return { ratings, metaDto };
    } else {
      const ratings = await query_builder.getMany();
      return { ratings, metaDto: null };
    }
  }
}
