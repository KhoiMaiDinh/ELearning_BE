import { BanController } from '@/api/ban/controllers/ban.controller';
import { CourseItemModule } from '@/api/course-item/course-item.module';
import { CourseModule } from '@/api/course/course.module';
import { ThreadModule } from '@/api/thread/thread.module';
import { UserModule } from '@/api/user/user.module';
import { QueueName } from '@/constants';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponModule } from '../coupon/coupon.module';
import { ReportController } from './controllers/report.controller';
import { UserWarningController } from './controllers/warning.controller';
import { UserBanEntity } from './entities/user-ban.entity';
import { UserReportEntity } from './entities/user-report.entity';
import { WarningEntity } from './entities/warning.entity';
import { ReportRepository } from './repositories/report.repository';
import { UserBanService } from './services/ban.service';
import { UserReportService } from './services/user-report.service';
import { WarningService } from './services/warning.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => ThreadModule),
    forwardRef(() => CourseItemModule),
    forwardRef(() => CouponModule),
    TypeOrmModule.forFeature([WarningEntity, UserBanEntity, UserReportEntity]),
    BullModule.registerQueue({
      name: QueueName.EMAIL,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
  ],
  controllers: [UserWarningController, BanController, ReportController],
  providers: [
    WarningService,
    UserBanService,
    UserReportService,
    ReportRepository,
  ],
  exports: [UserBanService, ReportRepository],
})
export class BanModule {}
