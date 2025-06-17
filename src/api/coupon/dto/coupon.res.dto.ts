import { CourseRes } from '@/api/course';
import { Nanoid, WrapperType } from '@/common';
import {
  BooleanField,
  ClassField,
  DateField,
  NumberField,
  StringField,
} from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CouponRes {
  @StringField()
  @Expose()
  code: Nanoid;

  @NumberField()
  @Expose()
  value: number;

  @DateField()
  @Expose()
  starts_at: Date;

  @DateField()
  @Expose()
  expires_at: Date;

  @NumberField()
  @Expose()
  usage_limit: number;

  @BooleanField()
  @Expose()
  is_active: boolean;

  @ClassField(() => CourseRes)
  @Expose()
  course: WrapperType<CourseRes>;

  @BooleanField()
  @Expose()
  is_public: boolean;

  @Expose()
  creator_roles?: string[];

  @Expose()
  creator_username?: string;
}
