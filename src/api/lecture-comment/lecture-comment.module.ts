import { CourseItemModule } from '@/api/course-item/course-item.module';
import { KafkaModule } from '@/kafka';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureCommentEntity } from './entities/lecture-comment.entity';
import { LectureCommentService } from './lecture-comment.service';

@Module({
  imports: [
    KafkaModule,
    forwardRef(() => CourseItemModule),
    TypeOrmModule.forFeature([LectureCommentEntity]),
  ],
  providers: [LectureCommentService],
  exports: [LectureCommentService],
})
export class LectureCommentModule {}
