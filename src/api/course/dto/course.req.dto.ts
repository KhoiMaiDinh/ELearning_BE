import { Nanoid } from '@/common';
import { StringField } from '@/decorators';
import { ValidateIf } from 'class-validator';

export class CourseReq {
  @ValidateIf((o: CourseReq) => !o.id)
  @StringField()
  slug: string;

  @ValidateIf((o: CourseReq) => !o.slug)
  @StringField()
  id: Nanoid;
}
