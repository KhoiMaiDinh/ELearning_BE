import { StringField } from '@/decorators';
import { IsNotEmpty } from 'class-validator';

export class GoogleLoginReq {
  @StringField()
  @IsNotEmpty()
  id_token: string;
}
