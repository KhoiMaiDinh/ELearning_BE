import { StringField } from '@/decorators/index';
import { IsNotEmpty } from 'class-validator';

export class GoogleLoginReq {
  @StringField()
  @IsNotEmpty()
  id_token: string;
}
