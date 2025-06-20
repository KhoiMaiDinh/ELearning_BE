import { CourseProgressModule } from '@/api/course-progress/course-progress.module';
import { CourseModule } from '@/api/course/course.module';
import { QueueName } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ProgressQueueEvents } from './progress-queue.event';
import { ProgressProcessor } from './progress-queue.processor';
import { ProgressQueueService } from './progress-queue.service';

@Module({
  imports: [
    CourseProgressModule,
    CourseModule,
    BullModule.registerQueue({
      name: QueueName.PROGRESS,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
  ],
  providers: [ProgressQueueService, ProgressProcessor, ProgressQueueEvents],
})
export class ProgressQueueModule {}
