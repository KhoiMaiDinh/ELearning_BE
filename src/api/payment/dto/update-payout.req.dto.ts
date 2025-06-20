import { MediaReq } from '@/api/media';
import { ClassField, EnumField, StringField } from '@/decorators';
import { ValidateIf } from 'class-validator';
import { PayoutStatus } from '../enums/payment-status.enum';

export class UpdatePayoutReq {
  @StringField()
  @ValidateIf((o) => o.payout_status === PayoutStatus.SENT)
  transaction_code?: string;

  @EnumField(() => PayoutStatus)
  payout_status?: PayoutStatus;

  @StringField({ nullable: true })
  @ValidateIf((o) => o.payout_status === PayoutStatus.FAILED)
  failure_reason?: string;

  @ClassField(() => MediaReq)
  @ValidateIf((o) => o.payout_status === PayoutStatus.SENT)
  evidence?: MediaReq;
}
