import { UserModule } from '@/api/user/user.module';
import { Module } from '@nestjs/common';
import { BanModule } from '../ban/ban.module';
import { CategoryModule } from '../category/category.module';
import { CourseProgressModule } from '../course-progress/course-progress.module';
import { CourseModule } from '../course/course.module';
import { InstructorModule } from '../instructor/instructor.module';
import { OrderModule } from '../order/order.module';
import { PaymentModule } from '../payment/payment.module';
import { DashboardController } from './dashboard.controller';
import { CategoryAnalyzer } from './services/category.analyzer';
import { CourseAnalyzer } from './services/course.analyzer';
import { DashboardService } from './services/dashboard.service';
import { InstructorDashboardService } from './services/instructor-dashboard.service';
import { InstructorAnalyzer } from './services/instructor.analyzer';
import { OrderAnalyzer } from './services/order.analyzer';
import { UserAnalyzer } from './services/user.analyzer';

@Module({
  imports: [
    InstructorModule,
    CourseModule,
    UserModule,
    OrderModule,
    BanModule,
    CategoryModule,
    CourseProgressModule,
    PaymentModule.forRootAsync(),
  ],
  providers: [
    DashboardService,
    UserAnalyzer,
    CourseAnalyzer,
    OrderAnalyzer,
    InstructorAnalyzer,
    CategoryAnalyzer,
    InstructorDashboardService,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
