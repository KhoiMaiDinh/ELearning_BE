import { CourseRes } from '@/api/course';
import { CourseItemDetailRes, CourseItemRes } from '@/api/course-item/dto';
import { Nanoid, WrapperType } from '@/common';
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

  @Expose()
  @ClassField(() => CourseRes)
  course: WrapperType<CourseRes>;
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

  @Expose()
  @ClassField(() => CourseRes)
  course: WrapperType<CourseRes>;
}
