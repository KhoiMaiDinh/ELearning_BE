import { EmailField, PasswordField } from '@/decorators/index';

export class EmailLoginReq {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}
