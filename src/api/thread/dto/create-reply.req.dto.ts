// threads/dto/create-thread.dto.ts
import { Nanoid } from '@/common';
import { StringField } from '@/decorators';

export class CreateReplyReq {
  @StringField({ maxLength: 2000 })
  content: string;

  thread_id: Nanoid;
}
