import {
  StringField,
  StringFieldOptional,
} from '@/decorators/field.decorators';

export class RegisterAsInstructorReq {
  @StringField({ maxLength: 1000, minLength: 50 })
  biography: string;

  @StringField({ maxLength: 60 })
  headline: string;

  @StringField()
  resume_url: string;

  @StringField()
  website_url?: string;

  @StringFieldOptional()
  facebook_url?: string;

  @StringFieldOptional()
  linkedin_url?: string;
}
