import { LectureCommentModule } from '@/api/lecture-comment/lecture-comment.module';
import { MediaModule } from '@/api/media';
import { KafkaModule } from '@/kafka';
import { Module } from '@nestjs/common';
import { CommentProcessConsumer } from './comment-process.consumer';
import { DocumentProcessConsumer } from './document-process.consumer';
import { ImageProcessConsumer } from './image-process.consumer';
import { VideoProcessConsumer } from './video-process.consumer';

@Module({
  imports: [MediaModule, KafkaModule, LectureCommentModule],
  controllers: [
    VideoProcessConsumer,
    ImageProcessConsumer,
    DocumentProcessConsumer,
    CommentProcessConsumer,
  ],
})
export class ConsumerModule {}
