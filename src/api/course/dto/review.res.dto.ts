import { UserRes } from '@/api/user';
import { ClassField, NumberField, StringFieldOptional } from '@/decorators';
import { Expose } from 'class-transformer';

export class CourseReviewRes {
  @Expose()
  @ClassField(() => UserRes)
  user: UserRes;

  @Expose()
  @NumberField()
  rating: number;

  @Expose()
  @StringFieldOptional({ maxLength: 100 })
  rating_comment: string | null;
}
