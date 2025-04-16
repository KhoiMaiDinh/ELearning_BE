import { MediaRepository } from '@/api/media';
import { Bucket, KafkaTopic, UploadStatus } from '@/constants';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class VideoProcessConsumer {
  private readonly logger = new Logger(VideoProcessConsumer.name);
  constructor(private readonly mediaRepository: MediaRepository) {}

  @EventPattern(KafkaTopic.VIDEO_PROCESS)
  async handleVideoProcessMessage(@Payload() message: any) {
    const { status, key, rejection_reason } = message;
    const media = await this.mediaRepository.findOneBy({
      key: key,
    });

    if (!media) return;
    media.status = message.status;
    if (status == UploadStatus.REJECTED)
      media.rejection_reason = rejection_reason;
    if (status == UploadStatus.VALIDATED) {
      media.bucket = Bucket.VIDEO;
      media.key = key.replace(/\.mp3|\.mov$/, '/master.m3u8');
    }

    await this.mediaRepository.save(media);
  }
}
