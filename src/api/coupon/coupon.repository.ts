import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CouponEntity } from './entities/coupon.entity';

@Injectable()
export class CouponRepository extends Repository<CouponEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CouponEntity, dataSource.createEntityManager());
  }
}
