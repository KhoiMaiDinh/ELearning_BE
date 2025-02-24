import { EmailField, PasswordField } from '@/decorators';

export class EmailLoginReq {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;
}
