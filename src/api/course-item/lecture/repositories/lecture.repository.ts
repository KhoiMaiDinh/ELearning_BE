import { LectureEntity } from '@/api/course-item/lecture/entities/lecture.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LectureRepository extends Repository<LectureEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(LectureEntity, dataSource.createEntityManager());
  }
}
