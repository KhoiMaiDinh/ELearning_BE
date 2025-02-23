import { UserRes } from '@/api/user/dto';
import {
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InstructorRes {
  @Expose()
  @StringField()
  biography: string;

  @Expose()
  @StringField()
  headline: string;

  @Expose()
  @StringField()
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

  @Exclude()
  @ClassFieldOptional(() => UserRes)
  user?: UserRes;
}
