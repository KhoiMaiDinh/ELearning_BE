import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EnrolledCourseEntity } from '../entities/enrolled-course.entity';

@Injectable()
export class EnrolledCourseRepository extends Repository<EnrolledCourseEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(EnrolledCourseEntity, dataSource.createEntityManager());
  }
}
