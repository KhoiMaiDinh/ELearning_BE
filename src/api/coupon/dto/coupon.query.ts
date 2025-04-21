import { BooleanFieldOptional } from '@/decorators';

export class CouponQuery {
  @BooleanFieldOptional({ default: false })
  check_usability?: boolean;
}
