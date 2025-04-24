import { CourseReq } from '@/api/course';
import {
  AfterDateField,
  ClassFieldOptional,
  DateField,
  EnumField,
  NumberField,
  NumberFieldOptional,
} from '@/decorators';
import { MinDate } from 'class-validator';
import { CouponType } from '../enum/coupon-type.enum';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

export class CreateCouponReq {
  @EnumField(() => CouponType)
  type: CouponType;

  @NumberField({ min: 1, max: 100, int: true })
  value: number;

  @DateField()
  @MinDate(tomorrow, {
    message: 'Start date must be at least 1 day in the future',
  })
  starts_at: Date;

  @DateField()
  @AfterDateField('starts_at', 1)
  expires_at: Date;

  @NumberFieldOptional({ min: 1 })
  usage_limit: number;

  @ClassFieldOptional(() => CourseReq)
  course?: CourseReq;
}
