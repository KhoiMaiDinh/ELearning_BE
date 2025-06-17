import { PageOffsetOptionsDto } from '@/common';
import {
  BooleanFieldOptional,
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators';
import { CourseLevel } from '../enums/course-level.enum';
import { CourseOrderBy } from '../enums/course-order-by.enum';
import { CourseQuery } from './course.query.dto';

export class CoursesQuery extends PageOffsetOptionsDto implements CourseQuery {
  @StringFieldOptional()
  category_slug?: string;

  @EnumFieldOptional(() => CourseLevel)
  level?: string;

  @NumberFieldOptional({ min: 0, default: 0 })
  min_price?: number;

  @NumberFieldOptional({})
  max_price?: number;

  @NumberFieldOptional({ min: 0, max: 5 })
  min_rating?: number;

  @StringFieldOptional()
  instructor_username?: string;

  @BooleanFieldOptional()
  with_instructor?: boolean;

  @BooleanFieldOptional()
  with_category?: boolean;

  @BooleanFieldOptional()
  include_disabled?: boolean;

  @EnumFieldOptional(() => CourseOrderBy)
  order_by?: CourseOrderBy;
}
