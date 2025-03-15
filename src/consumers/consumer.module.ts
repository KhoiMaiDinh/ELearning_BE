import { MediaModule } from '@/api/media';
import { KafkaModule } from '@/kafka';
import { Module } from '@nestjs/common';
import { ImageProcessConsumer } from './image-process.consumer';
import { VideoProcessConsumer } from './video-process.consumer';

@Module({
  imports: [MediaModule, KafkaModule],
  controllers: [VideoProcessConsumer, ImageProcessConsumer],
})
export class ConsumerModule {}
