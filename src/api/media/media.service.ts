import {
  Bucket,
  UPLOAD_TYPE_RESOURCE,
  UploadResource,
  UploadStatus,
} from '@/constants';
import { MinioClientService } from '@/libs/minio';
import { Injectable } from '@nestjs/common';
import { CreatePresignedUrlReq, PresignedUrlRes } from './dto';
import { MediaEntity } from './entities/media.entity';
import { MediaRepository } from './media.repository';

@Injectable()
export class MediaService {
  constructor(
    private readonly storageService: MinioClientService,
    private readonly mediaRepository: MediaRepository,
  ) {}
  async createPresignedUrl(
    dto: CreatePresignedUrlReq,
  ): Promise<PresignedUrlRes> {
    const { entity, entity_property, filename } = dto;
    let bucket: Bucket = Bucket.IMAGE;
    let file_size: number = 5 * 1024 * 1024; // 5MB limit
    if (UPLOAD_TYPE_RESOURCE[entity_property] === UploadResource.VIDEO) {
      bucket = Bucket.TEMP_VIDEO;
      file_size = 1024 * 1024 * 1024 * 10; // 10GB limit
    }
    if (UPLOAD_TYPE_RESOURCE[entity_property] === UploadResource.PDF) {
      bucket = Bucket.DOCUMENT;
    }

    const presignedUrlRes = await this.storageService.getPostPresignedUrl(
      entity,
      filename,
      bucket,
      file_size,
    );
    const {
      expires_at,
      result: {
        formData: { key },
      },
    } = presignedUrlRes;

    const newMedia = new MediaEntity({
      bucket,
      key,
      entity,
      entity_property,
      status: UploadStatus.PENDING,
      expires_at,
    });
    await newMedia.save();
    return presignedUrlRes;
  }
}
