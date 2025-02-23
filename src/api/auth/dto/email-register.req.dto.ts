import { EmailField, PasswordField, StringField } from '@/decorators/index';

export class EmailRegisterReq {
  @EmailField()
  email!: string;

  @PasswordField()
  password!: string;

  // @Matches(UsernameRegex.regex, {
  //   message: UsernameRegex.message,
  // })
  // @StringField({ maxLength: 16, minLength: 3 })
  // username!: string;

  @StringField({ maxLength: 60 })
  first_name?: string;

  @StringField({ maxLength: 60 })
  last_name?: string;
}
