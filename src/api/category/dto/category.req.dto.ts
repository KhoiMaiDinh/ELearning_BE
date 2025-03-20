import { StringField } from '@/decorators';

export class CategoryReq {
  @StringField()
  slug: string;
}
