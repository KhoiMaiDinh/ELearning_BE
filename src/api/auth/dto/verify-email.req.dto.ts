import { StringField } from '@/decorators/field.decorators';

export class VerifyEmailReq {
  @StringField()
  token!: string;
}
