import { CategoryRes } from '@/api/category/dto/category.res.dto';
import { MediaRes } from '@/api/media/dto/media.res.dto';
import { UserRes } from '@/api/user/dto/user.res.dto';
import { WrapperType } from '@/common';
import {
  BooleanField,
  ClassField,
  ClassFieldOptional,
  NumberFieldOptional,
  ObjectField,
  StringField,
  StringFieldOptional,
} from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { CertificateRes } from './certificate.res.dto';

@Exclude()
export class InstructorRes {
  @Expose()
  @ObjectField()
  biography: string;

  @Expose()
  @StringField()
  headline: string;

  @Expose()
  @ClassField(() => MediaRes)
  resume: MediaRes;

  @Expose()
  @ClassField(() => CertificateRes, { each: true })
  certificates?: WrapperType<CertificateRes[]>;

  @Expose()
  @StringFieldOptional()
  website_url?: string;

  @Expose()
  @StringFieldOptional()
  facebook_url?: string;

  @Expose()
  @StringFieldOptional()
  linkedin_url?: string;

  @Expose()
  @StringFieldOptional()
  disapproval_reason?: string;

  @Expose()
  @BooleanField()
  is_approved: boolean;

  @Expose()
  @ClassFieldOptional(() => UserRes)
  user?: WrapperType<UserRes>;

  @Expose()
  @ClassFieldOptional(() => CategoryRes)
  category?: CategoryRes;

  @Expose()
  @NumberFieldOptional()
  total_courses?: number;
}
