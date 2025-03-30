import { SectionEntity } from '@/api/section/entities/section.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SectionRepository extends Repository<SectionEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(SectionEntity, dataSource.createEntityManager());
  }
}
