import { BooleanFieldOptional } from '@/decorators';

export class CourseQuery {
  @BooleanFieldOptional()
  with_instructor?: boolean;

  @BooleanFieldOptional()
  with_category?: boolean;

  @BooleanFieldOptional()
  with_thumbnail?: boolean;

  @BooleanFieldOptional()
  with_sections?: boolean;
}
