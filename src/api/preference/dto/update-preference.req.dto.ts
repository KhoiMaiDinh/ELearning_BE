import { Language, Theme } from '@/constants';
import { EnumField } from '@/decorators';

export class UpdatePreferenceReq {
  @EnumField(() => Theme)
  theme: Theme;

  @EnumField(() => Language)
  language: Language;
}
