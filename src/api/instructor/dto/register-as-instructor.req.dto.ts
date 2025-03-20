import { CategoryReq } from '@/api/category';
import {
  ClassField,
  StringField,
  StringFieldOptional,
  TransformStorageUrl,
} from '@/decorators';

export class RegisterAsInstructorReq {
  @ClassField(() => CategoryReq)
  category: CategoryReq;

  @StringField()
  biography: string;

  @StringField({ maxLength: 60 })
  headline: string;

  @StringField()
  @TransformStorageUrl()
  resume: string;

  @StringField()
  website_url?: string;

  @StringFieldOptional()
  facebook_url?: string;

  @StringFieldOptional()
  linkedin_url?: string;

  @StringFieldOptional({ each: true })
  certificates?: string[];
}
