import { BooleanFieldOptional } from '@/decorators';

export class CurriculumQuery {
  @BooleanFieldOptional({ default: false })
  include_deleted_lectures: boolean;

  @BooleanFieldOptional({ default: false })
  is_show_hidden: boolean;
}
