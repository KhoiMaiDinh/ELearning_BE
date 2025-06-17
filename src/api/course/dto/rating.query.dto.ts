import { PageCursorOptionsDto } from '@/common';
import { EnumFieldOptional, NumberFieldOptional } from '@/decorators';
import { IntersectionType } from '@nestjs/swagger';
import { RatingOrderBy } from '../enums/rating-order-by.enum';

export class RatingQuery {
  @NumberFieldOptional({
    min: 1,
    max: 5,
    int: true,
  })
  rating?: number;

  @EnumFieldOptional(() => RatingOrderBy, { default: RatingOrderBy.CREATED_AT })
  order_by: RatingOrderBy;
}

export class CursorPaginateRatingQuery extends IntersectionType(
  PageCursorOptionsDto,
  RatingQuery,
) {}
