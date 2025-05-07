import { CategoryRes } from '@/api/category';
import { Language, Theme } from '@/constants';
import { ClassField, EnumField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PreferenceRes {
  @Expose()
  @EnumField(() => Theme)
  theme: Theme;

  @Expose()
  @EnumField(() => Language)
  language: Language;

  @Expose()
  @ClassField(() => CategoryRes, { each: true })
  categories: CategoryRes[];
}
