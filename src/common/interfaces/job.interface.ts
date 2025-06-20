import { PayoutBatchMetadata } from '@/api/notification/interfaces/metadata.interface';
import { Nanoid, Uuid } from '../types/common.type';

export interface IEmailJob {
  email: string;
}

export interface IStripeEventJob {
  event: string;
  data: any;
}

export interface IPayoutJob {
  instructor_id: Uuid;
}

export type IPayoutFinalizeJob = PayoutBatchMetadata;

export interface IProgressJob {
  user_id: Nanoid;
  course_id: Uuid;
}

export interface IHandleOrderExpirationJob {
  order_id: Nanoid;
}

export interface IVerifyEmailJob extends IEmailJob {
  token: string;
}

export interface IGiveCouponJob extends IEmailJob {
  coupon_code: Nanoid;
  reason: string;
}
