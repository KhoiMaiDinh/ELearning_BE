import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseItemModule } from '../course-item/course-item.module';
import { CourseModule } from '../course/course.module';
import { UserModule } from '../user';
import { UserLessonProgressEntity } from './entities/lesson-progress.entity';
import { LessonProgressService } from './lesson-progress.service';

@Module({
  imports: [
    UserModule,
    forwardRef(() => CourseModule),
    forwardRef(() => CourseItemModule),
    TypeOrmModule.forFeature([UserLessonProgressEntity]),
  ],
  providers: [LessonProgressService],
  exports: [LessonProgressService],
})
export class CourseProgressModule {}
