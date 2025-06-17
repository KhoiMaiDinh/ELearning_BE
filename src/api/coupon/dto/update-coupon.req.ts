import { OmitType } from '@nestjs/swagger';
import { CreateCouponReq } from './create-coupon.req.dto';

export class UpdateCouponReq extends OmitType(CreateCouponReq, [
  'course',
  'code',
]) {}
