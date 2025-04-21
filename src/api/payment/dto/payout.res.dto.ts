import { MediaRes } from '@/api/media';
import { Nanoid } from '@/common';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { PayoutStatus } from '../enums/payment-status.enum';

@Exclude()
export class PayoutRes {
  @Expose()
  id: Nanoid;

  @Expose()
  transfer_id?: string;

  @Expose()
  paid_out_sent_at?: Date;

  @Expose()
  bank_account_number: string;

  @Expose()
  bank_code: string;

  @Expose()
  amount: number;

  @Expose()
  payout_status?: PayoutStatus;

  @Expose()
  failure_reason?: string;

  @Expose()
  @ClassField(() => MediaRes)
  evidence?: MediaRes;

  //   @Expose()
  //   @Type(() => PayoutOrderDetailRes)
  //   details?: PayoutOrderDetailRes[];
}
