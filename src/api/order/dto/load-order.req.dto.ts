import { PaymentStatus } from '@/api/payment/enums/payment-status.enum';
import { PageOffsetOptionsDto } from '@/common';
import { EnumFieldOptional } from '@/decorators';

enum OrderBy {
  CREATED_AT = 'created_at',
  TOTAL_AMOUNT = 'total_amount',
}

export class LoadOrderQuery extends PageOffsetOptionsDto {
  @EnumFieldOptional(() => PaymentStatus)
  payment_status: PaymentStatus;

  @EnumFieldOptional(() => OrderBy)
  order_by: OrderBy;
}
