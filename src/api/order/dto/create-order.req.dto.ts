import { Nanoid } from '@/common';
import { StringField, StringFieldOptional } from '@/decorators';

export class CreateOrderReq {
  @StringField({ each: true })
  course_ids: Nanoid[];

  @StringFieldOptional()
  coupon_code: string;
}
