import { MediaRes } from '@/api/media';
import { UserRes } from '@/api/user';
import { Nanoid } from '@/common';
import { ClassField, DateField, NumberField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { PayoutStatus } from '../enums/payment-status.enum';
import { PayoutCourseContributionRes } from './payout-course-contribution.res.dto';

@Exclude()
export class PayoutRes {
  @Expose()
  id: Nanoid;

  @Expose()
  transfer_id?: string;

  @Expose()
  transaction_code: string;

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

  @Expose()
  @ClassField(() => UserRes)
  payee: UserRes;

  @Expose()
  @ClassField(() => PayoutCourseContributionRes)
  contributions?: PayoutCourseContributionRes[];

  @Expose()
  @DateField()
  issued_at: Date;

  @Expose()
  @DateField()
  updated_at: Date;

  @Expose()
  @DateField()
  created_at: Date;

  @Expose()
  @NumberField()
  year: number;

  @Expose()
  @NumberField()
  month: number;
}
