import { ApiAuth, ApiPublic, CurrentUser } from '@/decorators';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { JwtPayloadType } from '../token';
import { GetGrowthQuery, GetOverviewQuery, GetRevenueQuery } from './dto';
import { CategoryAnalyzer } from './services/category.analyzer';
import { DashboardService } from './services/dashboard.service';
import { InstructorDashboardService } from './services/instructor-dashboard.service';

@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly instructorDashboardService: InstructorDashboardService,
    private readonly categoryAnalyzer: CategoryAnalyzer,
  ) {}

  @Get('users/overview')
  @ApiPublic({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  getUsersOverview() {
    return this.dashboardService.getUserOverview();
  }

  @Get('overview')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getOverview(@Query() query: GetOverviewQuery) {
    return await this.dashboardService.getOverview(query);
  }

  @Get('growth')
  @ApiPublic({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getGrowth(@Query() query: GetGrowthQuery) {
    return await this.dashboardService.getGrowth(query);
  }

  @Get('instructors/overview')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  getInstructorOverview(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: GetOverviewQuery,
  ) {
    return this.instructorDashboardService.getOverview(user, query);
  }

  @Get('instructors/growth')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  getInstructorGrowth(
    @Query() query: GetGrowthQuery,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return this.instructorDashboardService.getStudentGrowth(user, query);
  }

  @Get('instructors/completion-rate')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  getInstructorCompletionRate(@CurrentUser() user: JwtPayloadType) {
    return this.instructorDashboardService.getCourseCompletionRate(user);
  }

  @Get('instructors/revenue')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getInstructorRevenue(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: GetRevenueQuery,
  ) {
    return await this.instructorDashboardService.getMonthlyRevenue(user, query);
  }

  @Get('instructors/revenue-by-course')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getInstructorRevenueByCourse(@CurrentUser() user: JwtPayloadType) {
    return await this.instructorDashboardService.getRevenueByCourse(user);
  }

  @Get('instructors/payout-summary')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getInstructorPayoutSummary(@CurrentUser() user: JwtPayloadType) {
    return await this.instructorDashboardService.summaryPayout(user);
  }

  @Get('instructors/next-payout')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getInstructorNextPayout(@CurrentUser() user: JwtPayloadType) {
    return await this.instructorDashboardService.getNextPayoutInfo(user);
  }

  @Get('instructors/student-engagement')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getInstructorStudentEngagement(@CurrentUser() user: JwtPayloadType) {
    return await this.instructorDashboardService.getAverageStudentEngagement(
      user,
    );
  }

  @Get('instructors/courses-rating')
  @ApiAuth({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  async getInstructorAvgCourseRating(@CurrentUser() user: JwtPayloadType) {
    return await this.instructorDashboardService.getAvgCourseRatings(user);
  }

  @Get('revenue')
  @ApiPublic({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  getRevenue(@Query() query: GetRevenueQuery) {
    return this.dashboardService.getRevenue(query);
  }

  @Get('category-stat')
  @ApiPublic({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  getCategoryStat(@Query('slug') slug: string | undefined) {
    return this.categoryAnalyzer.getCourseCount('business');
  }

  @Get('learning-funnel')
  @ApiPublic({
    summary: 'Get overview',
    statusCode: HttpStatus.OK,
  })
  getCourseFunnel(@Query('slug') slug: string | undefined) {
    return this.dashboardService.getLearningFunnel();
  }
}
