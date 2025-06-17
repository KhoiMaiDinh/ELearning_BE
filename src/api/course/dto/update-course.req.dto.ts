import { StringFieldOptional } from '@/decorators';
import { CreateCourseReq } from './create-course.req.dto';

export class UpdateCourseReq extends CreateCourseReq {
  // @EnumField(() => Language)
  // language: Language;

  @StringFieldOptional()
  slug?: string;
}
