import { OrderDetailRepository } from '@/api/order/repositories/order-detail.repository';
import { OrderRepository } from '@/api/order/repositories/order.repository';
import {
  PaymentStatus,
  PayoutStatus,
} from '@/api/payment/enums/payment-status.enum';
import { PayoutRepository } from '@/api/payment/repositories/payout.repository';
import { Uuid } from '@/common';
import { MONTHLY_LABELS } from '@/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderAnalyzer {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly orderDetailRepo: OrderDetailRepository,
    private readonly payoutRepo: PayoutRepository,
  ) {}

  async calculateRevenue(start?: Date, end?: Date): Promise<number> {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'sum');

    if (start) qb.andWhere('order.updatedAt >= :start', { start });
    if (end) qb.andWhere('order.updatedAt <= :end', { end });

    const result = await qb.getRawOne();
    return Number(result.sum) || 0;
  }

  async getMonthlyRevenue(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    const query_builder = this.orderRepo
      .createQueryBuilder('order')
      .select('EXTRACT(MONTH FROM order.createdAt)', 'month')
      .addSelect('SUM(order.total_amount)', 'total')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('order.payment_status = :status', {
        status: PaymentStatus.SUCCESS,
      })
      .groupBy('month')
      .orderBy('month');

    const result = await query_builder.getRawMany();
    const monthly_revenue = Array(12).fill(0);
    for (const row of result) {
      const monthIndex = parseInt(row.month, 10) - 1;
      monthly_revenue[monthIndex] = parseFloat(row.total);
    }

    return {
      labels: MONTHLY_LABELS,
      data: monthly_revenue,
    };
  }

  async getMonthlyInstructorRevenue(year: number, instructor_id?: Uuid) {
    const query_builder = this.orderDetailRepo
      .createQueryBuilder('detail')
      .innerJoin('detail.course', 'course')
      .innerJoin('detail.order', 'order')
      .select([
        `EXTRACT(MONTH FROM order.created_at) AS month`,
        `SUM(detail.final_price - detail.platform_fee)::float AS revenue`,
      ])
      .where('EXTRACT(YEAR FROM order.created_at) = :year', { year })
      .andWhere('order.payment_status = :status', {
        status: PaymentStatus.SUCCESS,
      });

    if (instructor_id) {
      query_builder.andWhere('course.instructor_id = :instructor_id', {
        instructor_id,
      });
    }

    query_builder.groupBy('month').orderBy('month');

    const raw_result = await query_builder.getRawMany();

    const monthlyRevenueMap = new Map<number, number>(
      raw_result.map((item) => [Number(item.month), parseFloat(item.revenue)]),
    );

    const labels = MONTHLY_LABELS;

    const data = Array.from(
      { length: 12 },
      (_, i) => monthlyRevenueMap.get(i + 1) || 0,
    );

    return {
      labels,
      data,
    };
  }

  async getRevenueByCourse(instructor_id: Uuid) {
    const raw_result = await this.orderDetailRepo
      .createQueryBuilder('detail')
      .innerJoin('detail.course', 'course')
      .innerJoin('detail.order', 'order')
      .select([
        'course.title AS title',
        'SUM(detail.final_price - detail.platform_fee)::float AS revenue',
      ])
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .andWhere('order.payment_status = :status', {
        status: PaymentStatus.SUCCESS,
      })
      .groupBy('course.title')
      .orderBy('revenue', 'DESC')
      .getRawMany();

    const labels = raw_result.map((item) => item.title);
    const data = raw_result.map((item) => parseFloat(item.revenue));

    return {
      labels,
      data,
    };
  }

  async getPayoutData(instructor_id: Uuid) {
    const now = new Date();
    const end_of_month = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const raw = await this.orderDetailRepo
      .createQueryBuilder('detail')
      .innerJoin('detail.course', 'course')
      .innerJoin('detail.order', 'order')
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .andWhere('order.payment_status = :status', {
        status: PaymentStatus.SUCCESS,
      })
      .select([
        `SUM(CASE WHEN detail.payout_due_at <= NOW() AND detail.payout_id IS NULL THEN (detail.final_price - detail.platform_fee) ELSE 0 END)::float AS "available"`,
        `SUM(CASE WHEN detail.payout_due_at > NOW() AND detail.payout_due_at <= :end_of_month AND detail.payout_id IS NULL THEN (detail.final_price - detail.platform_fee) ELSE 0 END)::float AS "holding"`,
        `SUM(CASE WHEN detail.payout_due_at > :end_of_month AND detail.payout_id IS NULL THEN (detail.final_price - detail.platform_fee) ELSE 0 END)::float AS "next_holding"`,
      ])
      .setParameter('end_of_month', end_of_month.toISOString())
      .getRawOne();

    const { available, holding, next_holding } = raw;
    const total = Number(available) + Number(holding);

    return {
      total: Number(total),
      available_for_payout: Number(available),
      in_30_day_holding: Number(holding),
      next_holding,
      available_percentage: total ? +((available / total) * 100).toFixed(1) : 0,
      holding_percentage: total ? +((holding / total) * 100).toFixed(1) : 0,
      next_holding_percentage: total
        ? +((next_holding / total) * 100).toFixed(1)
        : 0,
    };
  }

  async getNextPayoutInfo(instructor_id: Uuid) {
    const now = new Date();

    const data = await this.orderDetailRepo
      .createQueryBuilder('detail')
      .innerJoin('detail.course', 'course')
      .select('course.title', 'title')
      .addSelect(
        'SUM(detail.final_price - detail.platform_fee)::float',
        'amount',
      )
      .where('course.instructor_id = :instructor_id', { instructor_id })
      .andWhere('detail.payout_due_at <= :now', { now })
      .andWhere('detail.payout_id IS NULL')
      .groupBy('course.title')
      .getRawMany();

    const total = data.reduce((sum, row) => sum + Number(row.amount), 0);

    return {
      available_to_pay: total,
      breakdown: data.map((row) => ({
        id: row.id,
        title: row.title,
        amount: Number(row.amount),
      })),
    };
  }

  async getTotalPayout(instructor_id: string): Promise<number> {
    const result = await this.payoutRepo
      .createQueryBuilder('payout')
      .select('SUM(payout.amount)', 'total')
      .where('payout.payee_id = :instructor_id', {
        instructor_id: instructor_id,
      })
      .andWhere('payout.payout_status = :status', {
        status: PayoutStatus.SENT,
      })
      .getRawOne();

    return parseFloat(result?.total ?? '0');
  }
}
