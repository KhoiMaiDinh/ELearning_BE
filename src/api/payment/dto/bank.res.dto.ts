import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BankRes {
  @Expose()
  bank_code: string;

  @Expose()
  bank_name: string;

  @Expose()
  logo_link: string;
}
