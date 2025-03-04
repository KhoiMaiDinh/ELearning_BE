import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from '../category';
import { InstructorModule } from '../instructor';
import { CourseController } from './course.controller';
import { CourseRepository } from './course.repository';
import { CourseService } from './course.service';
import { CourseEntity } from './entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseEntity]),
    CategoryModule,
    InstructorModule,
  ],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
})
export class CourseModule {}
