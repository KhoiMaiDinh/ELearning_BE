import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class SuccessBasicDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ enum: HttpStatus })
  status_code: HttpStatus;
}
