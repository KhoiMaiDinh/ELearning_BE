import { CoursePriceHistoryEntity } from '@/api/price/entities/price-history.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PriceHistoryRepository extends Repository<CoursePriceHistoryEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CoursePriceHistoryEntity, dataSource.createEntityManager());
  }
}
