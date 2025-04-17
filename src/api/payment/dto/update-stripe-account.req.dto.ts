import { BooleanFieldOptional } from '@/decorators';
import { OmitType } from '@nestjs/swagger';
import { InitStripeConnectAccountReq } from './init-stripe-connect-account.req.dto';

export class UpdateStripeAccountReq extends OmitType(
  InitStripeConnectAccountReq,
  ['country_code'],
) {
  @BooleanFieldOptional() // set to true if you want to set this account as default
  is_default: boolean;
}
