import { LectureRes } from '@/api/course-item';
import { UserRes } from '@/api/user';
import { Nanoid, WrapperType } from '@/common';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { ReplyRes } from './reply.res.dto';

@Exclude()
export class ThreadRes {
  @Expose()
  id: Nanoid;

  @Expose()
  title: string;

  @Expose()
  content: string;

  @Expose()
  @ClassField(() => UserRes)
  author: UserRes;

  @Expose()
  @ClassField(() => LectureRes)
  lecture: LectureRes;

  @Expose()
  @ClassField(() => ReplyRes)
  replies: WrapperType<ReplyRes[]>;
}
