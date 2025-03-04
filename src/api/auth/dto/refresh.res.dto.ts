import { NumberField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RefreshRes {
  @Expose()
  @StringField()
  access_token!: string;

  @Exclude()
  @StringField()
  refresh_token!: string;

  @Expose()
  @NumberField()
  token_expires!: number;
}
