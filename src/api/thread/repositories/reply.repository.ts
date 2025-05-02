import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ReplyEntity } from '../entities/reply.entity';

@Injectable()
export class ReplyRepository extends Repository<ReplyEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ReplyEntity, dataSource.createEntityManager());
  }
}
