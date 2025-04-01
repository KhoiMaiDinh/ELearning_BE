import { Nanoid } from '@/common';
import { StringField } from '@/decorators';

export class MediaReq {
  @StringField()
  id: Nanoid;
}
