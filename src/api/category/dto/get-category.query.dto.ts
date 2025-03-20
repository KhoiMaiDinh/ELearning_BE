import { Language } from '@/constants';
import { BooleanFieldOptional, EnumFieldOptional } from '@/decorators';

export class GetCategoryQuery {
  @BooleanFieldOptional()
  with_children?: boolean;
  @BooleanFieldOptional()
  with_parent?: boolean;
  @EnumFieldOptional(() => Language)
  language?: Language;
}
