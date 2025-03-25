import { SectionRes } from '@/api/section';
import { Nanoid } from '@/common';
import { ClassField, StringField } from '@/decorators';

export class CurriculumRes {
  @StringField()
  id: Nanoid;
  @ClassField(() => SectionRes, { each: true })
  sections: SectionRes[];
}
