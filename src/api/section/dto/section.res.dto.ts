import { CourseItemDetailRes, CourseItemRes } from '@/api/course-item/dto';
import { Nanoid } from '@/common';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SectionRes {
  @Expose()
  id: Nanoid;

  @Expose()
  position: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  @ClassField(() => CourseItemRes, { each: true })
  items?: CourseItemRes[];
}

@Exclude()
export class SectionDetailRes {
  @Expose()
  id: Nanoid;

  @Expose()
  position: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  @ClassField(() => CourseItemDetailRes, { each: true })
  items?: CourseItemDetailRes[];
}
