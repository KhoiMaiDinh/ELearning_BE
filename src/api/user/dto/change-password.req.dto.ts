import { PasswordField } from '@/decorators/index';

export class ChangePasswordReq {
  @PasswordField()
  current_password: string;

  @PasswordField()
  new_password: string;
}
