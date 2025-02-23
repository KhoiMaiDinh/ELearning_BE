import { NumberField, StringField } from '@/decorators/index';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LoginRes {
  @Expose()
  @StringField()
  user_id!: string;

  @Expose()
  @StringField()
  access_token!: string;

  @Expose()
  @StringField()
  refresh_token!: string;

  @Expose()
  @NumberField()
  token_expires!: number;
}
