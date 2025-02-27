import { PostResDto } from '@/api/post/dto/post.res.dto';
import { WrapperType } from '@/common';
import { ClassField, StringField, URLField } from '@/decorators';
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

  @StringField()
  @Expose()
  first_name: string;

  @StringField()
  @Expose()
  last_name: string;

  @URLField()
  @Expose()
  profile_image: string;

  @ClassField(() => PostResDto)
  @Expose()
  posts?: WrapperType<PostResDto[]>;
}
