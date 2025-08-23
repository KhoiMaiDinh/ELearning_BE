import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CourseNotificationEntity } from '../entities/course-notification.entity';

@Injectable()
export class CourseNotificationRepository extends Repository<CourseNotificationEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CourseNotificationEntity, dataSource.createEntityManager());
  }
}
