import { StringField } from '@/decorators/index';
import { IsNotEmpty } from 'class-validator';

export class FacebookLoginReq {
  @StringField()
  @IsNotEmpty()
  input_token: string;
}
