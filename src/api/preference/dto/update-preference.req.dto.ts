import { CategoryReq } from '@/api/category';
import { Language, Theme } from '@/constants';
import { ClassField, EnumField } from '@/decorators';

export class UpdatePreferenceReq {
  @EnumField(() => Theme)
  theme: Theme;

  @EnumField(() => Language)
  language: Language;

  @ClassField(() => CategoryReq, { each: true })
  categories: CategoryReq[];
}
