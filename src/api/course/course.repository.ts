import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CategoryEntity } from '../category/entities/category.entity';
import { InstructorEntity } from '../instructor/entities/instructor.entity';
import { CourseEntity } from './entities/course.entity';

@Injectable()
export class CourseRepository extends Repository<CourseEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CourseEntity, dataSource.createEntityManager());
  }

  async createCourse({
    title,
    category,
    instructor,
  }: {
    title: string;
    category: CategoryEntity;
    instructor: InstructorEntity;
  }) {
    const course = new CourseEntity();
    course.title = title;
    course.category = category;
    course.instructor = instructor;
    return await this.save(course);
  }
}
