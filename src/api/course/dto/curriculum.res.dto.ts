import { SectionDetailRes } from '@/api/section';
import { Nanoid } from '@/common';
import { ClassField, StringField } from '@/decorators';
import { Expose } from 'class-transformer';

// @Exclude()
export class CurriculumRes {
  @Expose()
  @StringField()
  id: Nanoid;
  @Expose()
  @ClassField(() => SectionDetailRes, { each: true })
  sections: SectionDetailRes[];
}
