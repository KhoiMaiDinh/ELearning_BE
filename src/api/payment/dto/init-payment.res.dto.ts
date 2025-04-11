import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class InitPaymentRes {
  @Expose()
  vnp_url: string;
}
