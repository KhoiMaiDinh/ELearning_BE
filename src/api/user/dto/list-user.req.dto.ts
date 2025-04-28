import { PageOffsetOptionsDto } from '@/common';
import { StringFieldOptional } from '@/decorators';

export class ListUserReqDto extends PageOffsetOptionsDto {
  @StringFieldOptional()
  role: string;
}
