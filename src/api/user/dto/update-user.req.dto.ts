import { MediaReq } from '@/api/media/dto/media.req.dto';
import { ClassFieldOptional } from '@/decorators';
import { OmitType } from '@nestjs/swagger';
import { CreateUserReqDto } from './create-user.req.dto';

export class UpdateUserReqDto extends OmitType(CreateUserReqDto, [
  'email',
  'password',
] as const) {
  @ClassFieldOptional(() => MediaReq)
  profile_image?: MediaReq;
}
