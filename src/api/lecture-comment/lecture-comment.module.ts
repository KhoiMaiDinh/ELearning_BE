import { CourseItemModule } from '@/api/course-item/course-item.module';
import { UserModule } from '@/api/user/user.module';
import { KafkaModule } from '@/kafka';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorModule } from '../instructor/instructor.module';
import { CommentAspectEntity } from './entities/comment-aspect.entity';
import { LectureCommentEntity } from './entities/lecture-comment.entity';
import { LectureCommentController } from './lecture-comment.controller';
import { CommentAspectRepository } from './repositories/comment-aspect.repository';
import { LectureCommentRepository } from './repositories/lecture-comment.repository';
import { LectureCommentAnalyzer } from './services/lecture-comment.analyzer';
import { LectureCommentService } from './services/lecture-comment.service';

@Module({
  imports: [
    KafkaModule,
    forwardRef(() => UserModule),
    forwardRef(() => CourseItemModule),
    InstructorModule,
    TypeOrmModule.forFeature([LectureCommentEntity, CommentAspectEntity]),
  ],
  controllers: [LectureCommentController],
  providers: [
    LectureCommentService,
    LectureCommentAnalyzer,
    LectureCommentRepository,
    CommentAspectRepository,
  ],
  exports: [LectureCommentService, LectureCommentRepository],
})
export class LectureCommentModule {}
