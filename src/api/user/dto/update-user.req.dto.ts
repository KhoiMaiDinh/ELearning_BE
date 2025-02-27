import { StringFieldOptional } from '@/decorators';
import { TransformStorageUrl } from '@/decorators/transform-url.decorator';
import { OmitType } from '@nestjs/swagger';
import { CreateUserReqDto } from './create-user.req.dto';

export class UpdateUserReqDto extends OmitType(CreateUserReqDto, [
  'email',
  'password',
] as const) {
  @StringFieldOptional()
  @TransformStorageUrl()
  profile_image?: string;
}
