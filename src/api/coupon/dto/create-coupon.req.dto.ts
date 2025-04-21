import { CourseReq } from '@/api/course';
import {
  ClassFieldOptional,
  DateField,
  EnumField,
  NumberField,
} from '@/decorators';
import { CouponType } from '../enum/coupon-type.enum';

export class CreateCouponReq {
  @EnumField(() => CouponType)
  type: CouponType;

  @NumberField({ min: 1, max: 100, int: true })
  value: number;

  @DateField()
  starts_at: Date;

  @DateField()
  expires_at: Date;

  @NumberField({ min: 1 })
  usage_limit: number;

  @ClassFieldOptional(() => CourseReq)
  course?: CourseReq;
}
