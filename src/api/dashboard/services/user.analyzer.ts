import { UserRepository } from '@/api/user/user.repository';
import { DefaultRole, MONTHLY_LABELS } from '@/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAnalyzer {
  constructor(private readonly userRepo: UserRepository) {}

  async getNewMonthly(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const raw_result = await this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .select('EXTRACT(MONTH FROM user.createdAt)', 'month')
      .addSelect('COUNT(DISTINCT user.id)', 'count')
      .where('user.createdAt BETWEEN :start AND :end', { start, end })
      .andWhere('role.role_name IN (:...roles)', {
        roles: [DefaultRole.STUDENT, DefaultRole.INSTRUCTOR],
      })
      .groupBy('month')
      .orderBy('month')
      .getRawMany();

    const monthly_data = Array(12).fill(0);
    for (const row of raw_result) {
      const month = parseInt(row.month, 10);
      monthly_data[month - 1] = parseInt(row.count, 10);
    }

    return {
      labels: MONTHLY_LABELS,
      data: monthly_data,
    };
  }

  async count(start?: Date, end?: Date): Promise<number> {
    const query_builder = this.userRepo
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.role_name = :role_name', { role_name: DefaultRole.STUDENT });
    if (start) query_builder.andWhere('user.createdAt >= :start', { start });
    if (end) query_builder.andWhere('user.createdAt <= :end', { end });
    return query_builder.getCount();
  }
}
