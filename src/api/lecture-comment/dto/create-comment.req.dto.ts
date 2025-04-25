import { Nanoid } from '@/common';
import { StringField } from '@/decorators';

export class CreateCommentReq {
  @StringField()
  lecture_id: Nanoid;

  @StringField()
  content: string;
}
