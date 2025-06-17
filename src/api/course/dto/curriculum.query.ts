import { BooleanFieldOptional } from '@/decorators';

export class CurriculumQuery {
  @BooleanFieldOptional({ default: false })
  include_deleted_lectures: boolean;
}
