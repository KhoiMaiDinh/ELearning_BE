import { BooleanFieldOptional } from '@/decorators';
import { OmitType } from '@nestjs/swagger';
import { truncate } from 'fs/promises';
import { GetCategoryQuery } from './get-category.query.dto';

export class GetCategoriesQuery extends OmitType(GetCategoryQuery, [
  'with_parent',
]) {
  @BooleanFieldOptional({ default: truncate })
  declare with_children?: boolean;
}
