import { StringField } from '@/decorators';

export class CreateCourseNotificationReq {
  @StringField()
  title: string;
  @StringField()
  content: string;
}
