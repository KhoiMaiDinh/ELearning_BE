import { NumberField, StringField } from '@/decorators';

export class RefreshRes {
  @StringField()
  access_token!: string;

  @StringField()
  refresh_token!: string;

  @NumberField()
  token_expires!: number;
}
