import { CourseLevel } from '@/api/course/enums/course-level.enum';
import { MediaReq } from '@/api/media';
import { Language } from '@/constants';
import { ClassField, EnumField, NumberField, StringField } from '@/decorators';
import { CreateCourseReq } from './create-course.req.dto';

export class UpdateCourseReq extends CreateCourseReq {
  @StringField({ nullable: true, maxLength: 120 })
  subtitle?: string;

  @ClassField(() => MediaReq, { nullable: true })
  thumbnail?: MediaReq;

  @EnumField(() => Language)
  language: Language;

  @EnumField(() => CourseLevel, { nullable: true })
  level?: CourseLevel;

  @StringField({ isHtml: true, nullable: true })
  description?: string;

  @StringField()
  slug?: string;

  @StringField({ nullable: true, each: true, maxLength: 160 })
  requirements?: string[];

  @StringField({ nullable: true, each: true, maxLength: 160 })
  outcomes: string[];

  @NumberField({ nullable: true })
  price?: number;

  @EnumField(() => ['VND'], { nullable: true })
  currency?: string;
}
