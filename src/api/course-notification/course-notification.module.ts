import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from '../course/course.module';
import { CourseNotificationController } from './course-notification.controller';
import { CourseAnnouncementService } from './course-notification.service';
import { CourseNotificationEntity } from './entities/course-notification.entity';
import { CourseNotificationRepository } from './repositories/course-notification.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CourseNotificationEntity]), CourseModule],
  controllers: [CourseNotificationController],
  providers: [CourseAnnouncementService, CourseNotificationRepository],
})
export class CourseNotificationModule {}
