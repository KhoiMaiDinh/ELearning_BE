import { StringField, StringFieldOptional } from '@/decorators';
import { CreateCourseReq } from './create-course.req.dto';

export class UpdateCourseReq extends CreateCourseReq {
  // @EnumField(() => Language)
  // language: Language;

  @StringFieldOptional()
  slug?: string;

  @StringField({ nullable: true, each: true, maxLength: 160 })
  requirements?: string[];

  @StringField({ nullable: true, each: true, maxLength: 160 })
  outcomes: string[];
}
