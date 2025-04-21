import { StringField } from '@/decorators';

export class InitStripeConnectAccountReq {
  @StringField()
  country_code: string;
}
