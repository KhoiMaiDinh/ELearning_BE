import { CategoryModule } from '@/api/category/category.module';
import { CourseController } from '@/api/course/course.controller';
import { CourseService } from '@/api/course/course.service';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { EnrolledCourseEntity } from '@/api/course/entities/enrolled-course.entity';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { InstructorModule } from '@/api/instructor/instructor.module';
import { PriceModule } from '@/api/price/price.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, EnrolledCourseEntity]),
    CategoryModule,
    InstructorModule,
    PriceModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseRepository],
})
export class CourseModule {}
