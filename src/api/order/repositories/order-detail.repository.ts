import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderDetailEntity } from '../entities/order-detail.entity';

@Injectable()
export class OrderDetailRepository extends Repository<OrderDetailEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderDetailEntity, dataSource.createEntityManager());
  }
}
