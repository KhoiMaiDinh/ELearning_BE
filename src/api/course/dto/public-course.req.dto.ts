import { EnumField } from '@/decorators';
import { CourseStatus } from '../enums/course-status.enum';

export class PublicCourseReq {
  @EnumField(() => CourseStatus)
  status: CourseStatus;
}
