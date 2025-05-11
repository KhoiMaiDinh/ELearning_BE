import { PageOffsetOptionsDto } from '@/common';
import { Order } from '@/constants';
import { BooleanFieldOptional, EnumFieldOptional } from '@/decorators';

export class BanQuery extends PageOffsetOptionsDto {
  @EnumFieldOptional(() => Order)
  unbanned_order: Order;

  @BooleanFieldOptional()
  is_active: boolean;
}
