import { UserRes } from '@/api/user';
import { ClassField, DateField, StringField } from '@/decorators';

export class LectureCommentRes {
  @StringField()
  content: string;

  @DateField()
  created_at: Date;

  @ClassField(() => UserRes)
  user: UserRes;
}
