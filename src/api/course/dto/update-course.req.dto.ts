import { CourseLevel } from '@/api/course/enums/course-level.enum';
import { Language } from '@/constants';
import {
  EnumField,
  EnumFieldOptional,
  ObjectField,
  StringField,
  StringFieldOptional,
  TransformStorageUrl,
} from '@/decorators';
import { StorageImage, StorageVideo } from '@/libs/minio';
import { CreateCourseReq } from './create-course.req.dto';

export class UpdateCourseReq extends CreateCourseReq {
  @StringFieldOptional({ maxLength: 120 })
  subtitle?: string;

  @StringFieldOptional()
  @TransformStorageUrl()
  thumbnail?: StorageImage;

  @StringFieldOptional()
  @TransformStorageUrl()
  preview?: StorageVideo;

  @EnumField(() => Language)
  language: Language;

  @EnumFieldOptional(() => CourseLevel)
  level?: CourseLevel;

  @ObjectField({ nullable: true })
  description?: object;

  @StringFieldOptional()
  slug?: string;

  @StringField({ nullable: true, each: true, maxLength: 160 })
  requirements: string[] | null;

  @StringField({ nullable: true, each: true, maxLength: 160 })
  outcomes: string[] | null;
}
