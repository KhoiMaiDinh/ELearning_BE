import { Nanoid } from '@/common';
import { StringField } from '@/decorators';

export class CreateOrderReq {
  @StringField({ each: true })
  course_ids: Nanoid[];

  @StringField()
  coupon_code: string;
}
