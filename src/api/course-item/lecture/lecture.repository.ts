import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LectureEntity } from './lecture.entity';

@Injectable()
export class LectureRepository extends Repository<LectureEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(LectureEntity, dataSource.createEntityManager());
  }
}
