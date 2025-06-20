import { CategoryReq } from '@/api/category';
import { ClassField } from '@/decorators';

export class UpdatePreferenceReq {
  // @EnumField(() => Theme)
  // theme: Theme;

  // @EnumField(() => Language)
  // language: Language;

  @ClassField(() => CategoryReq, { each: true })
  categories: CategoryReq[];
}
