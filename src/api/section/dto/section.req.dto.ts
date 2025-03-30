import { Nanoid } from '@/common';
import { StringField } from '@/decorators';

export class SectionReq {
  @StringField()
  id: Nanoid;
}
