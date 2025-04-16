import { BooleanFieldOptional } from '@/decorators';
import { OmitType } from '@nestjs/swagger';
import { GetCategoryQuery } from './get-category.query.dto';

export class GetCategoriesQuery extends OmitType(GetCategoryQuery, [
  'with_parent',
]) {
  @BooleanFieldOptional()
  declare with_children?: boolean;
}
