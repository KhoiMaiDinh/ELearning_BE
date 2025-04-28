import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LectureCommentEntity } from './entities/lecture-comment.entity';

@Injectable()
export class LectureCommentRepository extends Repository<LectureCommentEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(LectureCommentEntity, dataSource.createEntityManager());
  }
}
