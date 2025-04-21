import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InitPaymentRes {
  @Expose()
  payment_url: string;
}
