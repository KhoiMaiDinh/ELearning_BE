import { InstructorRes } from '@/api/instructor';
import { MediaRes } from '@/api/media';
import { PostResDto } from '@/api/post/dto/post.res.dto';
import { RoleRes } from '@/api/role';
import { WrapperType } from '@/common';
import { ClassField, StringField } from '@/decorators';
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

  @ClassField(() => MediaRes)
  @Expose()
  profile_image: MediaRes;

  @ClassField(() => PostResDto)
  @Expose()
  posts?: WrapperType<PostResDto[]>;

  @ClassField(() => RoleRes)
  @Expose()
  roles?: WrapperType<RoleRes[]>;

  @ClassField(() => InstructorRes)
  @Expose()
  instructor_profile?: WrapperType<InstructorRes>;
}
