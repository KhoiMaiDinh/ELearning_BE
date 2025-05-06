import { CourseModule } from '@/api/course/course.module';
import { UserModule } from '@/api/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseItemModule } from '../course-item/course-item.module';
import { UserLessonProgressEntity } from './entities/lesson-progress.entity';
import { LessonProgressService } from './lesson-progress.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => CourseItemModule),
    TypeOrmModule.forFeature([UserLessonProgressEntity]),
  ],
  providers: [LessonProgressService],
  exports: [LessonProgressService],
})
export class CourseProgressModule {}
