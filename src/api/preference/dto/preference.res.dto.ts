import { Language, Theme } from '@/constants';
import { EnumField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PreferenceRes {
  @Expose()
  @EnumField(() => Theme)
  theme: Theme;

  @Expose()
  @EnumField(() => Language)
  language: Language;
}
