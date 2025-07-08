import { JwtPayloadType } from '@/api/token';
import { UserRepository } from '@/api/user/user.repository';
import { Nanoid } from '@/common';
import {
  Bucket,
  ErrorCode,
  KafkaTopic,
  UPLOAD_TYPE_RESOURCE,
  UploadResource,
  UploadStatus,
} from '@/constants';
import { InternalServerException } from '@/exceptions';
import { KafkaProducerService } from '@/kafka';
import { MinioClientService } from '@/libs/minio';
import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreatePresignedUrlReq, PresignedUrlRes } from './dto';
import { MediaEntity } from './entities/media.entity';
import { MediaRepository } from './media.repository';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly storageService: MinioClientService,
    private readonly mediaRepository: MediaRepository,
    private readonly producerService: KafkaProducerService,
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

  async handleMediaUploaded(media_key: Nanoid, bucket: Bucket): Promise<void> {
    const media = await this.mediaRepository.findOneByKey(media_key);

    media.status =
      bucket === Bucket.IMAGE || bucket === Bucket.DOCUMENT
        ? UploadStatus.VALIDATED
        : UploadStatus.UPLOADED;
    await media.save();

    if (bucket === Bucket.TEMP_VIDEO) {
      try {
        this.logger.log('Sending video uploaded event to Kafka');
        await this.producerService.send(KafkaTopic.VIDEO_UPLOADED, {
          Records: [
            {
              eventName: 's3:ObjectCreated:Post',
              s3: {
                bucket: {
                  name: bucket,
                },
                object: {
                  key: media.key,
                },
              },
            },
          ],
        });
      } catch (error) {
        this.logger.error(error);
        throw new InternalServerException(ErrorCode.V000);
      }
    }
  }
}
