import { CategoryReq } from '@/api/category';
import { MediaReq } from '@/api/media';
import {
  ClassField,
  ClassFieldOptional,
  StringField,
  StringFieldOptional,
} from '@/decorators';

export class RegisterAsInstructorReq {
  @ClassField(() => CategoryReq)
  category: CategoryReq;

  @StringField()
  biography: string;

  @StringField({ maxLength: 60 })
  headline: string;

  @ClassField(() => MediaReq)
  resume: MediaReq;

  @StringField()
  website_url?: string;

  @StringFieldOptional()
  facebook_url?: string;

  @StringFieldOptional()
  linkedin_url?: string;

  @ClassFieldOptional(() => MediaReq, { each: true })
  certificates?: MediaReq[];
}
