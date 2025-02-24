import { PasswordField } from '@/decorators';

export class ChangePasswordReq {
  @PasswordField()
  current_password: string;

  @PasswordField()
  new_password: string;
}
