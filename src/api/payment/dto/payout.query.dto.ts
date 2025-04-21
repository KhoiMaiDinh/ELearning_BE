import { PageOffsetOptionsDto } from '@/common';
import { EnumFieldOptional } from '@/decorators';
import { PayoutStatus } from '../enums/payment-status.enum';

export class PayoutQuery extends PageOffsetOptionsDto {
  @EnumFieldOptional(() => PayoutStatus)
  status: PayoutStatus;
}
