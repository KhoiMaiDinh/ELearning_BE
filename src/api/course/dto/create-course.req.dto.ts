import { CategoryReq } from '@/api/category';
import { ClassField, StringField } from '@/decorators';

export class CreateCourseReq {
  @StringField({ maxLength: 60 })
  title: string;
  @ClassField(() => CategoryReq)
  category: CategoryReq;
}
