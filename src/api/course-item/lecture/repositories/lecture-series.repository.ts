import { LectureSeriesEntity } from '@/api/course-item/lecture/entities/lecture-series.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LectureSeriesRepository extends Repository<LectureSeriesEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(LectureSeriesEntity, dataSource.createEntityManager());
  }
}
