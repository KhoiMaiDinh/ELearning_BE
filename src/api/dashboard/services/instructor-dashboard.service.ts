import { InstructorRepository } from '@/api/instructor';
import { PayoutRepository } from '@/api/payment/repositories/payout.repository';
import { JwtPayloadType } from '@/api/token';
import { Uuid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { GetGrowthQuery, GetOverviewQuery, GetRevenueQuery } from '../dto';
import { CourseAnalyzer } from './course.analyzer';
import { OrderAnalyzer } from './order.analyzer';

@Injectable()
export class InstructorDashboardService {
  private readonly begin = new Date(2023, 0, 1);
  constructor(
    private readonly courseAnalyzer: CourseAnalyzer,
    private readonly orderAnalyzer: OrderAnalyzer,
    private readonly instructorRepo: InstructorRepository,
    private readonly payoutRepo: PayoutRepository,
  ) {}

  async getOverview(user_payload: JwtPayloadType, query: GetOverviewQuery) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    const begin = this.begin;
    const month_end = new Date(query.year, query.month, 0, 23, 59, 59, 999);
    const previous_month_end = new Date(month_end);
    previous_month_end.setMonth(previous_month_end.getMonth() - 1);

    const month_stats = await this.getStats(
      begin,
      month_end,
      instructor.instructor_id,
    );
    const previous_month_stats = await this.getStats(
      begin,
      previous_month_end,
      instructor.instructor_id,
    );

    const total_payout = await this.orderAnalyzer.getTotalPayout(
      instructor.user.user_id,
    );

    const avg_rating = await this.courseAnalyzer.getInstructorAvgRating(
      instructor.instructor_id,
    );

    const enrolled_students_monthly_shift = this.calculateChange(
      month_stats.enrolled_students,
      previous_month_stats.enrolled_students,
    );
    const active_students_monthly_shift = this.calculateChange(
      month_stats.active_students,
      previous_month_stats.active_students,
    );

    return {
      ...month_stats,
      ...avg_rating,
      total_payout,
      enrolled_students_monthly_shift,
      active_students_monthly_shift,
    };
  }

  private async getStats(start: Date, end: Date, instructor_id: Uuid) {
    const enrolled_students = await this.courseAnalyzer.countEnrolled(
      start,
      end,
      instructor_id,
    );
    const start_of_month = new Date(end);
    start_of_month.setDate(1);
    const active_students = await this.courseAnalyzer.getActiveStudent(
      start_of_month,
      end,
      instructor_id,
    );

    return {
      enrolled_students,
      active_students,
    };
  }

  async getStudentGrowth(user_payload: JwtPayloadType, query: GetGrowthQuery) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    const begin = this.begin;
    const previous_year_end = new Date(query.year - 1, 11, 31, 23, 59, 59, 999);
    const monthly_enrolled = await this.courseAnalyzer.getMonthlyEnrolled(
      query.year,
      instructor.instructor_id,
    );
    const previous_enrolled = await this.courseAnalyzer.countEnrolled(
      begin,
      previous_year_end,
      instructor.instructor_id,
    );
    (monthly_enrolled as any).cumulative_data = this.getCumulative(
      previous_enrolled,
      monthly_enrolled.data,
    );

    return { ...monthly_enrolled, year: query.year };
  }

  async getCourseCompletionRate(user_payload: JwtPayloadType) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    return await this.courseAnalyzer.getCompletionRates(
      instructor.instructor_id,
    );
  }

  async getMonthlyRevenue(
    user_payload: JwtPayloadType,
    query: GetRevenueQuery,
  ) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    return await this.orderAnalyzer.getMonthlyInstructorRevenue(
      query.year,
      instructor.instructor_id,
    );
  }

  async summaryPayout(user_payload: JwtPayloadType) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    return await this.orderAnalyzer.getPayoutData(instructor.instructor_id);
  }

  async getNextPayoutInfo(user_payload: JwtPayloadType) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    return await this.orderAnalyzer.getNextPayoutInfo(instructor.instructor_id);
  }

  async getAverageStudentEngagement(user_payload: JwtPayloadType) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    return await this.courseAnalyzer.getAverageEngagement(
      instructor.instructor_id,
    );
  }

  async getRevenueByCourse(user_payload: JwtPayloadType) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    return await this.orderAnalyzer.getRevenueByCourse(
      instructor.instructor_id,
    );
  }

  async getAvgCourseRatings(user_payload: JwtPayloadType) {
    const instructor = await this.instructorRepo.findOne({
      where: { user: { id: user_payload.id } },
      relations: ['user'],
    });
    if (!instructor) throw new NotFoundException(ErrorCode.E012);
    return await this.courseAnalyzer.getAverageRatings(
      instructor.instructor_id,
    );
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
}
