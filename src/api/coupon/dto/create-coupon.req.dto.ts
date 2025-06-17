import { CourseReq } from '@/api/course';
import { Nanoid } from '@/common';
import {
  AfterDateField,
  BooleanField,
  ClassFieldOptional,
  DateField,
  DateFieldOptional,
  EnumField,
  NumberField,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators';
import { MinDate } from 'class-validator';
import { CouponType } from '../enum/coupon-type.enum';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

export class CreateCouponReq {
  @StringFieldOptional({ minLength: 1, maxLength: 14 })
  code?: Nanoid;

  @EnumField(() => CouponType)
  type: CouponType;

  @NumberField({ min: 1, max: 100, int: true })
  value: number;

  @DateField()
  @MinDate(tomorrow, {
    message: 'Start date must be at least 1 day in the future',
  })
  starts_at: Date;

  @DateFieldOptional()
  @AfterDateField('starts_at', 1)
  expires_at?: Date;

  @BooleanField()
  is_public: boolean;

  @NumberFieldOptional({ min: 1 })
  usage_limit: number;

  @ClassFieldOptional(() => CourseReq)
  course?: CourseReq;
}
