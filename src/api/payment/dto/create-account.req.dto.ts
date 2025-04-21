import { StringField } from '@/decorators';

export class CreateAccountReq {
  @StringField()
  name: string;

  @StringField()
  bank_code: string;

  @StringField()
  bank_account_number: string;
}
