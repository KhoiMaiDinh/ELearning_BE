import { PostResDto } from '@/api/post/dto/post.res.dto';
import { WrapperType } from '@/common/index';
import { ClassField, StringField } from '@/decorators/index';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserRes {
  @StringField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  username: string;

  @StringField()
  @Expose()
  email: string;

  @ClassField(() => PostResDto)
  @Expose()
  posts?: WrapperType<PostResDto[]>;

  @ClassField(() => Date)
  @Expose()
  createdAt: Date;

  @ClassField(() => Date)
  @Expose()
  updatedAt: Date;
}
