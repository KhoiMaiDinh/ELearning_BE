import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserLessonProgressEntity } from './entities/lesson-progress.entity';

@Injectable()
export class LessonProgressRepository extends Repository<UserLessonProgressEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserLessonProgressEntity, dataSource.createEntityManager());
  }
}
