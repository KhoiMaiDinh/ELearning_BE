import { DataResponseDto } from 'src/common/dto/data-response.dto';
import { Type } from 'class-transformer';
import { UserInfoResDto } from './teacher-profile.res.dto';

export class GetUserInfoResDto extends DataResponseDto<UserInfoResDto> {
  @Type(() => UserInfoResDto)
  data: UserInfoResDto;
}
