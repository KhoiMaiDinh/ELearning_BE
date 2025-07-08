import { SuccessBasicDto } from '@/common';
import { ApiAuth, ApiPublic, CurrentUser } from '@/decorators';
import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtPayloadType } from '../token';
import {
  CreatePresignedUrlReq,
  PresignedUrlRes,
  StorageUploadReq,
} from './dto';
import { MediaService } from './media.service';

@ApiTags('medias')
@Controller({ version: '1', path: 'medias' })
export class MediaController {
  private readonly logger = new Logger(MediaController.name);
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

  @Post('storage-uploads')
  @ApiPublic({
    summary: 'Handle Storage Upload Notification',
    type: SuccessBasicDto,
    statusCode: HttpStatus.OK,
  })
  async handledUpload(@Req() req: Request) {
    const base64Body = (req as any).body || '';
    this.logger.log(base64Body);

    const body_object = plainToInstance(StorageUploadReq, base64Body);

    await this.mediaService.handleMediaUploaded(
      body_object.key,
      body_object.bucket,
    );
    return plainToInstance(SuccessBasicDto, {
      message: 'Uploaded Notify Successfully',
      status_code: HttpStatus.OK,
    });
  }
}
