import { StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccountRes {
  @Expose()
  @StringField()
  name: string;

  @Expose()
  @StringField()
  bank_code: string;

  @Expose()
  @StringField()
  bank_account_number: string;
}
