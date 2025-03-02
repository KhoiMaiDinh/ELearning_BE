import { StringField } from '@/decorators';
import { CreateCategoryReq } from './create-category.req.dto';

export class UpdateCategoryReq extends CreateCategoryReq {
  @StringField()
  declare slug: string;
}
