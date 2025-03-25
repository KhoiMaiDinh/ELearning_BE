import { CourseItemType } from '@/api/course-item';
import { Nanoid } from '@/common';
import {
  BooleanField,
  ClassField,
  ClassFieldOptional,
  EnumField,
  StringField,
  StringFieldOptional,
} from '@/decorators';

export class UpsertCurriculumReq {
  @ClassField(() => CreateSectionReq, { each: true })
  sections: CreateSectionReq[];
}

class CreateSectionReq {
  @StringField()
  title: string;
  @StringFieldOptional()
  id: Nanoid;

  @ClassFieldOptional(() => CreateCourseItemReq, { each: true })
  items: CreateCourseItemReq[];
}

export class CreateCourseItemReq {
  @StringField({ maxLength: 60 })
  title: string;
  @StringFieldOptional({ minLength: 13, maxLength: 13 })
  id?: Nanoid;
  @EnumField(() => CourseItemType)
  type: CourseItemType;
  @BooleanField()
  is_preview: boolean;
}
