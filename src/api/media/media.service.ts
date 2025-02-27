import { MinioClientService } from '@/libs/minio';
import { Injectable } from '@nestjs/common';
import { CreatePresignedUrlReq, PresignedUrlRes } from './dto';

@Injectable()
export class MediaService {
  constructor(private readonly storageService: MinioClientService) {}
  async createPresignedUrl(
    dto: CreatePresignedUrlReq,
  ): Promise<PresignedUrlRes> {
    const { resource, filename } = dto;
    return await this.storageService.getPresignedUrl(resource, filename);
  }
}
