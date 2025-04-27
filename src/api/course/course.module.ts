import { CategoryModule } from '@/api/category/category.module';
import { CourseProgressModule } from '@/api/course-progress/course-progress.module';
import { CourseController } from '@/api/course/course.controller';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { EnrolledCourseEntity } from '@/api/course/entities/enrolled-course.entity';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { CourseService } from '@/api/course/services/course.service';
import { EnrollCourseService } from '@/api/course/services/enroll-course.service';
import { InstructorModule } from '@/api/instructor/instructor.module';
import { MediaModule } from '@/api/media';
import { PriceModule } from '@/api/price/price.module';
import { SectionModule } from '@/api/section/section.module';
import { UserModule } from '@/api/user';
import { MinioClientModule } from '@/libs/minio';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity, EnrolledCourseEntity]),
    UserModule,
    CategoryModule,
    InstructorModule,
    PriceModule,
    MediaModule,
    MinioClientModule,
    forwardRef(() => CourseProgressModule),
    forwardRef(() => SectionModule),
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository, EnrollCourseService],
  exports: [CourseRepository, EnrollCourseService, CourseService],
})
export class CourseModule {}
