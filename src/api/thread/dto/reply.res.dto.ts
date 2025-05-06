import { UserRes } from '@/api/user';

import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReplyRes {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  author: UserRes;

  @Expose()
  createdAt: Date;

  @Expose()
  has_upvoted: boolean;

  @Expose()
  vote_count: number;
}
