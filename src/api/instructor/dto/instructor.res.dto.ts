import { UserRes } from '@/api/user/dto';
import {
  ClassFieldOptional,
  ObjectField,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { RestoreStorageUrl } from '@/decorators/transform-url.decorator';
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
}
