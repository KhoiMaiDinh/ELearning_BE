import { Uuid } from '@/common';
import { Injectable } from '@nestjs/common';
import { LessThan, LessThanOrEqual } from 'typeorm';

import { OrderDetailEntity } from '../entities/order-detail.entity';
import { OrderDetailRepository } from '../repositories/order-detail.repository';

@Injectable()
export class OrderDetailService {
  constructor(private readonly orderDetailRepo: OrderDetailRepository) {}

  findDueForPayoutItems() {
    const now = new Date();
    return this.orderDetailRepo.find({
      where: {
        payout_due_at: LessThan(now),
      },
    });
  }

  async findPayableInstructor() {
    const now = new Date();

    const payees = await this.orderDetailRepo
      .createQueryBuilder('item')
      .select('DISTINCT c.instructor_id', 'instructor_id')
      .innerJoin('item.course', 'c')
      .select('DISTINCT c.instructor_id', 'instructor_id')
      .where('item.payout_due_at <= :now', { now })
      .andWhere('item.payout_id IS NULL')
      .getRawMany();

    return payees.map((item) => item.instructor_id);
  }

  async findPayableByInstructor(instructor_id: Uuid) {
    const now = new Date();

    const orders = await this.orderDetailRepo.find({
      where: {
        course: {
          instructor_id,
        },
        payout_due_at: LessThanOrEqual(now),
      },
      relations: {
        course: { instructor: { user: { account: true } } },
      },
    });

    return orders;
  }

  async save(details: OrderDetailEntity[]) {
    return await this.orderDetailRepo.save(details);
  }
}
