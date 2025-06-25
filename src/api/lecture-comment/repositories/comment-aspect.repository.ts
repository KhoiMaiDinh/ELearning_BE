import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommentAspectEntity } from '../entities/comment-aspect.entity';

@Injectable()
export class CommentAspectRepository extends Repository<CommentAspectEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CommentAspectEntity, dataSource.createEntityManager());
  }
}
