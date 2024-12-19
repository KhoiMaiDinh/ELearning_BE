import { IsEmail, IsEnum, IsString, Max } from 'class-validator';
import { RegisterMethod } from '@app/common';
import { IsNullable } from '@app/common/decorators';

export class CreateAccountReq {
  @IsString()
  @Max(60)
  first_name: string;

  @IsString()
  @Max(60)
  last_name: string;

  @IsEmail()
  email: string;

  @IsNullable()
  @IsString()
  profile_img: string | null;

  @IsNullable()
  @IsString()
  facebook_id: string | null;

  @IsNullable()
  @IsString()
  google_id: string | null;

  @IsNullable()
  @IsString()
  password: string | null;

  @IsEnum(RegisterMethod)
  register_method: RegisterMethod;
}
