import { Uuid } from '@/common';
import { Injectable } from '@nestjs/common';
import { LessThan } from 'typeorm';

import { PayoutCourseContributionRes } from '@/api/payment/dto/payout-course-contribution.res.dto';
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

    return await this.orderDetailRepo
      .createQueryBuilder('detail')
      .innerJoinAndSelect('detail.course', 'course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user')
      .leftJoinAndSelect('user.account', 'account')
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .andWhere('detail.payout_due_at <= :now', { now })
      .andWhere('detail.payout_id IS NULL')
      .getMany();
  }

  async save(details: OrderDetailEntity[]) {
    return await this.orderDetailRepo.save(details);
  }

  async findPayoutCourseContribution(payout_ids: Uuid[]) {
    const raw_contributions = await this.orderDetailRepo
      .createQueryBuilder('od')
      .leftJoin('od.course', 'course')
      .select('od.payout_id', 'payout_id')
      .addSelect('course.title', 'title')
      .addSelect('SUM(ROUND(od.final_price))', 'final_price')
      .addSelect('SUM(ROUND(od.platform_fee))', 'platform_fee')
      .where('od.payout_id IN (:...payout_ids)', { payout_ids })
      .groupBy('od.payout_id')
      .addGroupBy('course.id')
      .addGroupBy('course.title')
      .getRawMany();

    const contributions_map = new Map<string, PayoutCourseContributionRes[]>();
    for (const row of raw_contributions) {
      const entry: PayoutCourseContributionRes = {
        course_title: row.title,
        final_price: Number(row.final_price),
        platform_fee: Number(row.platform_fee),
        net_revenue: Number(row.final_price) - Number(row.platform_fee),
      };
      if (!contributions_map.has(row.payout_id)) {
        contributions_map.set(row.payout_id, []);
      }
      contributions_map.get(row.payout_id).push(entry);
    }
    return contributions_map;
  }
}
