import { CourseModule } from '@/api/course/course.module';
import { QueueName } from '@/constants';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponModule } from '../coupon/coupon.module';
import { CourseItemModule } from '../course-item/course-item.module';
import { ThreadModule } from '../thread/thread.module';
import { UserModule } from '../user';
import { BanController } from './controllers/ban.controller';
import { ReportController } from './controllers/report.controller';
import { UserWarningController } from './controllers/warning.controller';
import { UserBanEntity } from './entities/user-ban.entity';
import { UserReportEntity } from './entities/user-report.entity';
import { WarningEntity } from './entities/warning.entity';
import { UserBanService } from './services/ban.service';
import { UserReportService } from './services/user-report.service';
import { WarningService } from './services/warning.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => ThreadModule),
    forwardRef(() => CourseItemModule),
    CouponModule,
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
  providers: [WarningService, UserBanService, UserReportService],
  exports: [UserBanService],
})
export class BanModule {}
