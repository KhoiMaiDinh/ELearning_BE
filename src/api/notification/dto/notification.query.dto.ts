import { PageCursorOptionsDto } from '@/common';
import { Language } from '@/constants';
import { EnumFieldOptional } from '@/decorators';

export class NotificationQuery extends PageCursorOptionsDto {
  @EnumFieldOptional(() => Language, { default: Language.VI })
  lang?: Language;
}
