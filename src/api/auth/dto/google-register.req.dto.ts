import { EmailField, StringField } from '@/decorators';

export class GoogleRegisterReq {
  @EmailField()
  email!: string;

  @StringField()
  google_id!: string;

  @StringField({ maxLength: 60 })
  first_name!: string;

  @StringField({ maxLength: 60 })
  last_name!: string;

  @StringField({ maxLength: 16, minLength: 3 })
  username!: string;
}
