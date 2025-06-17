import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../../ban/repositories/report.repository';
import { GetGrowthQuery, GetOverviewQuery, GetRevenueQuery } from '../dto';
import { CourseAnalyzer } from './course.analyzer';
import { InstructorAnalyzer } from './instructor.analyzer';
import { OrderAnalyzer } from './order.analyzer';
import { UserAnalyzer } from './user.analyzer';

@Injectable()
export class DashboardService {
  private readonly begin = new Date(2023, 0, 1);
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly userAnalyzer: UserAnalyzer,
    private readonly courseAnalyzer: CourseAnalyzer,
    private readonly orderAnalyzer: OrderAnalyzer,
    private readonly instructorAnalyzer: InstructorAnalyzer,
  ) {}
  async getOverview(query: GetOverviewQuery) {
    const begin = this.begin;
    const month_end = new Date(query.year, query.month, 0, 23, 59, 59, 999);
    const previous_month_end = new Date(month_end);
    previous_month_end.setMonth(previous_month_end.getMonth() - 1);

    const month_stats = await this.getStats(begin, month_end);
    const previous_month_stats = await this.getStats(begin, previous_month_end);

    const pending_report_count = await this.getPendingReportCount(
      begin,
      month_end,
    );

    const change = {
      total_instructors: this.calculateChange(
        month_stats.total_instructors,
        previous_month_stats.total_instructors,
      ),
      total_students: this.calculateChange(
        month_stats.total_students,
        previous_month_stats.total_students,
      ),
      total_courses: this.calculateChange(
        month_stats.total_courses,
        previous_month_stats.total_courses,
      ),
      total_revenue: this.calculateChange(
        month_stats.total_revenue,
        previous_month_stats.total_revenue,
      ),
    };

    return {
      stats: month_stats,
      previous_stats: previous_month_stats,
      pending_report_count,
      change,
    };
  }

  async getGrowth(query: GetGrowthQuery) {
    const begin = this.begin;
    const previous_year_end = new Date(query.year - 1, 11, 31, 23, 59, 59, 999);
    const previous_year_user_count = await this.userAnalyzer.count(
      begin,
      previous_year_end,
    );
    const previous_year_instructor_count = await this.instructorAnalyzer.count(
      begin,
      previous_year_end,
    );
    const user_growth = await this.userAnalyzer.getNewMonthly(query.year);
    const instructor_growth = await this.instructorAnalyzer.getNewMonthly(
      query.year,
    );

    (user_growth as any).cumulative_data = this.getCumulative(
      previous_year_user_count,
      user_growth.data,
    );
    (instructor_growth as any).cumulative_data = this.getCumulative(
      previous_year_instructor_count,
      instructor_growth.data,
    );

    return {
      user_growth,
      instructor_growth,
    };
  }

  async getRevenue(query: GetRevenueQuery) {
    const begin = this.begin;
    const year_end = new Date(query.year - 1, 11, 31, 23, 59, 59, 999);
    const monthly_revenue = await this.orderAnalyzer.getMonthlyRevenue(
      query.year,
    );

    const previous_year_revenue = await this.orderAnalyzer.calculateRevenue(
      begin,
      year_end,
    );
    (monthly_revenue as any).cumulative_data = this.getCumulative(
      previous_year_revenue,
      monthly_revenue.data,
    );

    return {
      monthly_revenue,
    };
  }

  async getLearningFunnel() {
    const begin = this.begin;
    const current_date = new Date();

    const enrolled = await this.courseAnalyzer.countEnrolled(
      begin,
      current_date,
    );
    const progresses = await this.courseAnalyzer.getLearningProgressOverview(
      begin,
      current_date,
    );
    const reviewed = await this.courseAnalyzer.reviewedCount(
      begin,
      current_date,
    );

    const users_started = new Set<string>();
    const users25 = new Set<string>();
    const users50 = new Set<string>();
    const users75 = new Set<string>();
    const users100 = new Set<string>();

    for (const row of progresses) {
      const ratio = parseFloat(row.completion_ratio);
      if (ratio < 0.25) users_started.add(row.user_id);
      if (ratio >= 0.25) users25.add(row.user_id);
      if (ratio >= 0.5) users50.add(row.user_id);
      if (ratio >= 0.75) users75.add(row.user_id);
      if (ratio >= 1.0) users100.add(row.user_id);
    }

    return {
      enrolled,
      started_learning: users_started.size,
      completed_25: users25.size,
      completed_50: users50.size,
      completed_75: users75.size,
      completed_100: users100.size,
      reviewed,
    };
  }

  private getCumulative(init_count: number, data: number[]): number[] {
    const cumulative = [];
    let running_total = init_count;

    for (let i = 0; i < data.length; i++) {
      running_total += data[i];
      cumulative.push(running_total);
    }

    return cumulative;
  }

  private calculateChange(current: number, previous: number) {
    if (previous === 0) {
      if (current === 0) return 0;
      return '∞';
    }
    return ((current - previous) / previous) * 100;
  }

  private async getStats(start?: Date, end?: Date) {
    const [total_instructors, total_students, total_courses, total_revenue] =
      await Promise.all([
        this.instructorAnalyzer.count(start, end),
        this.userAnalyzer.count(start, end),
        this.courseAnalyzer.count(start, end),
        this.orderAnalyzer.calculateRevenue(start, end),
      ]);

    return {
      total_instructors,
      total_students,
      total_courses,
      total_revenue,
    };
  }

  private async getPendingReportCount(
    start?: Date,
    end?: Date,
  ): Promise<number> {
    const query_builder = this.reportRepo
      .createQueryBuilder('report')
      .where('report.is_reviewed = false');
    if (start) query_builder.andWhere('report.created_at >= :start', { start });
    if (end) query_builder.andWhere('report.created_at <= :end', { end });
    return query_builder.getCount();
  }
}
