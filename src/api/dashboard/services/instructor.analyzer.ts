import { InstructorRepository } from '@/api/instructor';
import { MONTHLY_LABELS } from '@/constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InstructorAnalyzer {
  constructor(private readonly instructorRepo: InstructorRepository) {}

  async getNewMonthly(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const raw_result = await this.instructorRepo
      .createQueryBuilder('instructor')
      .select('EXTRACT(MONTH FROM instructor.approved_at)', 'month')
      .addSelect('COUNT(DISTINCT instructor.instructor_id)', 'count')
      .where('instructor.approved_at BETWEEN :start AND :end', { start, end })
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
    const query_builder = this.instructorRepo.createQueryBuilder('instructor');
    if (start)
      query_builder.andWhere('instructor.approved_at >= :start', { start });
    if (end) query_builder.andWhere('instructor.approved_at <= :end', { end });
    return query_builder.getCount();
  }
}
