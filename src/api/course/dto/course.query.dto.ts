import { BooleanFieldOptional } from '@/decorators';

export class CourseQuery {
  @BooleanFieldOptional()
  with_instructor?: boolean;

  @BooleanFieldOptional()
  with_category?: boolean;
}
