import { MediaReq } from '@/api/media';
import { ClassField, EnumField, StringField } from '@/decorators';
import { PayoutStatus } from '../enums/payment-status.enum';

export class UpdatePayoutReq {
  @StringField()
  transfer_id?: string;

  @StringField()
  bank_account_number: string;

  @StringField()
  bank_code: string;

  @EnumField(() => PayoutStatus)
  payout_status?: PayoutStatus;

  @StringField({ nullable: true })
  failure_reason?: string;

  @ClassField(() => MediaReq)
  evidence?: MediaReq;
}
