import {
  ObjectField,
  StringField,
  StringFieldOptional,
  URLField,
} from '@/decorators/field.decorators';
import { TransformStorageUrl } from '@/decorators/transform-url.decorator';

export class RegisterAsInstructorReq {
  @ObjectField()
  biography: object;

  @StringField({ maxLength: 60 })
  headline: string;

  @URLField({ isAppUrl: true, require_tld: false })
  @TransformStorageUrl()
  resume_url: string;

  @StringField()
  website_url?: string;

  @StringFieldOptional()
  facebook_url?: string;

  @StringFieldOptional()
  linkedin_url?: string;

  @URLField({ isAppUrl: true, require_tld: false, nullable: true })
  @TransformStorageUrl()
  first_certificate_url?: string;

  @URLField({ isAppUrl: true, require_tld: false, nullable: true })
  @TransformStorageUrl()
  second_certificate_url?: string;

  @URLField({ isAppUrl: true, require_tld: false, nullable: true })
  @TransformStorageUrl()
  third_certificate_url?: string;
}
