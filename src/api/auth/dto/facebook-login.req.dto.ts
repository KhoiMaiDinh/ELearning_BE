import { StringField } from '@/decorators';
import { IsNotEmpty } from 'class-validator';

export class FacebookLoginReq {
  @StringField()
  @IsNotEmpty()
  input_token: string;
}
