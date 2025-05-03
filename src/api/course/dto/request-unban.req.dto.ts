import { StringField } from '@/decorators';

export class RequestCourseUnbanReq {
  @StringField({ maxLength: 1000 })
  reason: string;
}
