// threads/dto/create-thread.dto.ts
import { Nanoid } from '@/common';
import { StringField } from '@/decorators';

export class CreateThreadDto {
  @StringField({ maxLength: 200 })
  title: string;

  @StringField({ maxLength: 2000 })
  content: string;

  @StringField()
  lecture_id: Nanoid;
}
