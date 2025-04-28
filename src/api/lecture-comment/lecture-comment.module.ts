import { CourseItemModule } from '@/api/course-item/course-item.module';
import { UserModule } from '@/api/user/user.module';
import { KafkaModule } from '@/kafka';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentAspectEntity } from './entities/comment-aspect.entity';
import { LectureCommentEntity } from './entities/lecture-comment.entity';
import { LectureCommentRepository } from './lecture-comment.repository';
import { LectureCommentService } from './lecture-comment.service';

@Module({
  imports: [
    KafkaModule,
    UserModule,
    forwardRef(() => CourseItemModule),
    TypeOrmModule.forFeature([LectureCommentEntity, CommentAspectEntity]),
  ],
  providers: [LectureCommentService, LectureCommentRepository],
  exports: [LectureCommentService, LectureCommentRepository],
})
export class LectureCommentModule {}
