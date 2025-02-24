import { EmailField, StringField } from '@/decorators';
import { Matches } from 'class-validator';
import { UsernameRegex } from '../../../regex';

export class FacebookRegisterReq {
  @EmailField()
  email!: string;

  @StringField()
  facebook_id!: string;

  @StringField({ maxLength: 60 })
  first_name!: string;

  @StringField({ maxLength: 60 })
  last_name!: string;

  @Matches(UsernameRegex.regex, {
    message: UsernameRegex.message,
  })
  @StringField({ maxLength: 16, minLength: 3 })
  username!: string;
}
