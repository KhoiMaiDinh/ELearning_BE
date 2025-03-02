import { CategoryRes } from '@/api/category';
import { UserRes } from '@/api/user/dto';
import {
  ClassFieldOptional,
  ObjectField,
  RestoreStorageUrl,
  StringField,
  StringFieldOptional,
} from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InstructorRes {
  @Expose()
  @ObjectField()
  biography: string;

  @Expose()
  @StringField()
  headline: string;

  @Expose()
  @StringField()
  @RestoreStorageUrl()
  resume_url: string;

  @Expose()
  @StringFieldOptional()
  website_url?: string;

  @Expose()
  @StringFieldOptional()
  facebook_url?: string;

  @Expose()
  @StringFieldOptional()
  linkedin_url?: string;

  @Exclude()
  @StringField()
  is_approved: boolean;

  @Expose()
  @ClassFieldOptional(() => UserRes)
  user?: UserRes;

  @Expose()
  @ClassFieldOptional(() => CategoryRes)
  category?: CategoryRes;
}
