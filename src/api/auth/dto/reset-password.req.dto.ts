import { PasswordField, StringField } from '@/decorators/field.decorators';

export class ResetPasswordReq {
  @StringField()
  token: string;
  @PasswordField()
  password: string;
}
