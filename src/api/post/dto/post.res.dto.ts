import { UserRes } from '@/api/user/dto/user.res.dto';
import { WrapperType } from '@/common';
import {
  ClassField,
  DateField,
  StringField,
  StringFieldOptional,
  UUIDField,
} from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PostResDto {
  @UUIDField()
  @Expose()
  id: string;

  @StringField()
  @Expose()
  title: string;

  @StringField()
  @Expose()
  slug: string;

  @StringFieldOptional()
  @Expose()
  description?: string;

  @StringFieldOptional()
  @Expose()
  content?: string;

  @ClassField(() => UserRes)
  @Expose()
  user: WrapperType<UserRes>;

  @StringField()
  @Expose()
  createdBy: string;

  @StringField()
  @Expose()
  updatedBy: string;

  @DateField()
  @Expose()
  createdAt: Date;

  @DateField()
  @Expose()
  updatedAt: Date;
}
