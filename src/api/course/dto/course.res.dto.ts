import { CategoryRes } from '@/api/category';
import { CourseLevel, CourseStatus } from '@/api/course';
import { InstructorRes } from '@/api/instructor';
import { MediaRes } from '@/api/media';
import { Nanoid } from '@/common';
import { Language } from '@/constants';
import { ClassField, EnumField, NumberField, StringField } from '@/decorators';
import { StorageVideo } from '@/libs/minio';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CourseRes {
  @Expose()
  @StringField()
  id: Nanoid;

  @Expose()
  @StringField()
  title: string;
  @Expose()
  @StringField()
  slug: string;

  @Expose()
  @ClassField(() => CategoryRes)
  category: CategoryRes;

  @Expose()
  @ClassField(() => InstructorRes)
  instructor: InstructorRes;

  @Expose()
  @StringField({ nullable: true })
  subtitle: string | null;

  @Expose()
  @ClassField(() => MediaRes)
  thumbnail: MediaRes | null;

  @Expose()
  @StringField({ nullable: true })
  preview: StorageVideo | null;

  @Expose()
  @StringField({ nullable: true })
  description: string;

  @Expose()
  @EnumField(() => Language)
  language: Language;

  @Expose()
  level: CourseLevel | null;

  @Expose()
  @StringField({ nullable: true, each: true })
  requirements: string[] | null;

  @Expose()
  @StringField({ nullable: true, each: true })
  outcomes: string[] | null;

  @Expose()
  @NumberField({ nullable: true })
  price: number | null;

  @Expose()
  status: CourseStatus;
}
