import { EmailField } from '@/decorators/field.decorators';

export class ForgotPasswordReq {
  @EmailField()
  email: string;
}
