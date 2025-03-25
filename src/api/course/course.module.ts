import { CategoryModule } from '@/api/category/category.module';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { InstructorModule } from '@/api/instructor/instructor.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseEntity } from './entities/course.entity';
import { EnrolledCourseEntity } from './entities/enrolled-course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, EnrolledCourseEntity]),
    CategoryModule,
    InstructorModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseRepository],
})
export class CourseModule {}
