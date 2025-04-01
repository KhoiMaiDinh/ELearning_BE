import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import {
  Bucket,
  UPLOAD_TYPE_RESOURCE,
  UploadResource,
  UploadStatus,
} from '@/constants';
import { MinioClientService } from '@/libs/minio';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreatePresignedUrlReq, PresignedUrlRes } from './dto';
import { MediaEntity } from './entities/media.entity';
import { MediaRepository } from './media.repository';

@Injectable()
export class MediaService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly storageService: MinioClientService,
    private readonly mediaRepository: MediaRepository,
  ) {}
  async createPresignedUrl(
    user: JwtPayloadType,
    dto: CreatePresignedUrlReq,
  ): Promise<PresignedUrlRes> {
    const { entity, entity_property, filename } = dto;

    const user_info = await this.userRepository.findOneByPublicId(user.id);

    let bucket: Bucket = Bucket.IMAGE;
    let file_size: number = 5 * 1024 * 1024; // 5MB limit
    if (UPLOAD_TYPE_RESOURCE[entity_property] === UploadResource.VIDEO) {
      bucket = Bucket.TEMP_VIDEO;
      file_size = 1024 * 1024 * 1024 * 10; // 10GB limit
    }
    if (UPLOAD_TYPE_RESOURCE[entity_property] === UploadResource.PDF) {
      bucket = Bucket.DOCUMENT;
    }

    const presigned_url_res = await this.storageService.getPostPresignedUrl(
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
    } = presigned_url_res;

    const new_media = new MediaEntity({
      bucket,
      key,
      entity,
      entity_property,
      status: UploadStatus.PENDING,
      user_id: user_info.user_id,
      expires_at,
    });
    await new_media.save();
    return plainToInstance(PresignedUrlRes, {
      ...presigned_url_res,
      id: new_media.id,
    });
  }
}
