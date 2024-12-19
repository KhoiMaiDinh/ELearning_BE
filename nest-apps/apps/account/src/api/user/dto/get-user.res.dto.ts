import { DataResponseDto } from 'src/common/dto/data-response.dto';
import { UserResDto } from './user.res.dto';
import { Type } from 'class-transformer';

export class GetUserResDto extends DataResponseDto<UserResDto> {
  @Type(() => UserResDto)
  data: UserResDto;
}
