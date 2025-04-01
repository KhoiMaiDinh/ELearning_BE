import { ApiAuth, CurrentUser } from '@/decorators';
import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtPayloadType } from '../token';
import { CreatePresignedUrlReq, PresignedUrlRes } from './dto';
import { MediaService } from './media.service';

@ApiTags('medias')
@Controller({ version: '1', path: 'medias' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @ApiAuth({
    summary: 'Create Presigned URL',
    type: PresignedUrlRes,
    statusCode: HttpStatus.CREATED,
  })
  async createPresignedUrl(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreatePresignedUrlReq,
  ): Promise<PresignedUrlRes> {
    return await this.mediaService.createPresignedUrl(user, dto);
  }
}
