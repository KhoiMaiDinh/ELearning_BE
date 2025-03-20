import { MediaRepository } from '@/api/media';
import { KafkaTopic, UploadStatus } from '@/constants';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class DocumentProcessConsumer {
  private readonly logger = new Logger(DocumentProcessConsumer.name);
  constructor(private readonly mediaRepository: MediaRepository) {}

  @EventPattern(KafkaTopic.DOCUMENT_PROCESS)
  async handleImageProcessMessage(@Payload() message: any) {
    const { status, key, rejection_reason } = message;
    const media = await this.mediaRepository.findOneByKey(key);

    if (!media) return;
    media.status = message.status;
    if (status == UploadStatus.REJECTED)
      media.rejection_reason = rejection_reason;

    await media.save();
  }
}
