import { BooleanFieldOptional } from '@/decorators';

export class GetCategoryQuery {
  @BooleanFieldOptional()
  with_children?: boolean;
  @BooleanFieldOptional()
  with_parent?: boolean;
}
