import { UserRes } from '@/api/user';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { CourseRes } from './course.res.dto';

@Exclude()
export class RatingResDto {
  @Expose()
  rating: number;
  @Expose()
  rating_comment: string;
  @Expose()
  reviewed_at: Date;
  @Expose()
  @ClassField(() => CourseRes)
  course: CourseRes;
  @Expose()
  @ClassField(() => UserRes)
  user: UserRes;
}
