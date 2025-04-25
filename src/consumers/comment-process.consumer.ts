import { Aspect, Emotion } from '@/api/lecture-comment/enum';
import { LectureCommentService } from '@/api/lecture-comment/lecture-comment.service';
import { Uuid } from '@/common';
import { KafkaTopic } from '@/constants';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class DocumentProcessConsumer {
  private readonly logger = new Logger(DocumentProcessConsumer.name);
  constructor(private readonly commentService: LectureCommentService) {}

  @EventPattern(KafkaTopic.COMMENT_PROCESSED)
  async handleAnalyzedComment(
    @Payload()
    message: {
      comment_id: Uuid;
      aspects: { aspect: Aspect; emotion: Emotion }[];
    },
  ) {
    await this.commentService.saveAnalysis(message.comment_id, message.aspects);
  }
}
