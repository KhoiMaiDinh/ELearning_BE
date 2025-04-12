import { CategoryReq } from '@/api/category';
import { MediaReq } from '@/api/media';
import { ClassField, EnumField, NumberField, StringField } from '@/decorators';
import { CourseLevel } from '../enums/course-level.enum';

export class CreateCourseReq {
  @StringField({ maxLength: 60 })
  title: string;

  @ClassField(() => CategoryReq)
  category: CategoryReq;

  @StringField({ maxLength: 120 })
  subtitle?: string;

  @StringField({ isHtml: true, nullable: true })
  description?: string;

  @ClassField(() => MediaReq)
  thumbnail?: MediaReq;

  @EnumField(() => CourseLevel, { nullable: true })
  level?: CourseLevel;

  @NumberField({ nullable: true })
  price?: number;
}
