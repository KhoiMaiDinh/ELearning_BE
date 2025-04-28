import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PayoutEntity } from '../entities/payout.entity';

@Injectable()
export class PayoutRepository extends Repository<PayoutEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PayoutEntity, dataSource.createEntityManager());
  }
}
