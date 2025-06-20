import { UserRes } from '@/api/user';

import { WrapperType } from '@/common';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { ThreadRes } from './thread.res.dto';

@Exclude()
export class ReplyRes {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  author: UserRes;

  @Expose()
  @ClassField(() => ThreadRes)
  thread: WrapperType<ThreadRes>;

  @Expose()
  createdAt: Date;

  @Expose()
  has_upvoted: boolean;

  @Expose()
  vote_count: number;
}
