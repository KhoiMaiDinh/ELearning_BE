import { Nanoid } from '@/common';
import { EnumField, StringField } from '@/decorators';
import { WarningType } from '../enum/warning-type.enum';

export class ReportReq {
  reporter_id: Nanoid;

  @EnumField(() => WarningType)
  type: WarningType;
  @StringField()
  content_id: Nanoid;
  @StringField()
  reason: string;
}
