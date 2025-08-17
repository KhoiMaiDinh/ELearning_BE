import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WarningEntity } from '../entities/warning.entity';

@Injectable()
export class WarningRepository extends Repository<WarningEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(WarningEntity, dataSource.createEntityManager());
  }
}
