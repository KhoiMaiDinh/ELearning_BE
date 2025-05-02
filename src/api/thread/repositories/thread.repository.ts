import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ThreadEntity } from '../entities/thread.entity';

@Injectable()
export class ThreadRepository extends Repository<ThreadEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ThreadEntity, dataSource.createEntityManager());
  }
}
