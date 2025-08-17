import { ICourseProgress } from '@/api/course-progress/interfaces';
import { UserRes } from '@/api/user';
import { OffsetPaginatedDto } from '@/common';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

export class EnrollUsersRes extends OffsetPaginatedDto<EnrollUserRes> {}

@Exclude()
export class EnrollUserRes {
  @Expose()
  @ClassField(() => UserRes)
  user?: UserRes;
  @Expose()
  progress: ICourseProgress;
}
