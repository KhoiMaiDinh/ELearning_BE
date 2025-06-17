import { CourseModule } from '@/api/course/course.module';
import { UserModule } from '@/api/user/user.module';
import { QueueName } from '@/constants';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseItemModule } from '../course-item/course-item.module';
import { UserLessonProgressEntity } from './entities/lesson-progress.entity';
import { LessonProgressRepository } from './lesson-progress.repository';
import { LessonProgressService } from './lesson-progress.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => CourseItemModule),
    TypeOrmModule.forFeature([UserLessonProgressEntity]),
    BullModule.registerQueue({
      name: QueueName.PROGRESS,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
  ],
  providers: [LessonProgressService, LessonProgressRepository],
  exports: [LessonProgressService, LessonProgressRepository],
})
export class CourseProgressModule {}
