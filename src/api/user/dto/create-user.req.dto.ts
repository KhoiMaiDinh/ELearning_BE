import {
  EmailField,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '@/decorators';
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { Transform } from 'class-transformer';

export class CreateUserReqDto {
  @StringField()
  @Transform(lowerCaseTransformer)
  username: string;

  @EmailField()
  email: string;

  @PasswordField()
  password: string;

  @StringFieldOptional()
  profile_image?: string;

  @StringField()
  first_name: string;

  @StringField()
  last_name: string;
}
