import {
  EmailField,
  PasswordField,
  StringField,
  StringFieldOptional,
} from '@/decorators';
import { TransformStorageUrl } from '@/decorators/transform-url.decorator';
import { lowerCaseTransformer } from '@/utils/transformers/lower-case.transformer';
import { IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

class UserAuthInfo {
  @StringField()
  @Transform(lowerCaseTransformer)
  username: string;

  @EmailField()
  email: string;

  @PasswordField()
  password: string;
}

export class UserBasicInfo {
  @StringField()
  first_name: string;

  @StringField()
  last_name: string;

  @StringFieldOptional()
  @TransformStorageUrl()
  profile_image?: string;
}

export class CreateUserReqDto extends IntersectionType(
  UserBasicInfo,
  UserAuthInfo,
) {}
