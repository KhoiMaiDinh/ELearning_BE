import { UserRes } from '@/api/user';

import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReplyRes {
  @Expose()
  content: string;

  @Expose()
  user: UserRes;

  @Expose()
  createdAt: Date;

  @Exclude()
  has_upvoted: boolean;

  @Expose()
  vote_count: number;
}
