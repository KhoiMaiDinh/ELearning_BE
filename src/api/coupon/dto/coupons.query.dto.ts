import { PageOffsetOptionsDto } from '@/common';
import { BooleanFieldOptional, EnumFieldOptional } from '@/decorators';
import { CouponFrom } from '../enum/coupon-from.enum';
import { CouponStatus } from '../enum/coupon-status.enum';

export class CouponsQuery extends PageOffsetOptionsDto {
  @BooleanFieldOptional()
  is_active?: boolean;
  @BooleanFieldOptional()
  is_public?: boolean;
  @EnumFieldOptional(() => CouponStatus)
  status?: CouponStatus;
  @BooleanFieldOptional()
  usage_exceeded?: boolean;
  @EnumFieldOptional(() => CouponFrom)
  from?: CouponFrom;
}
