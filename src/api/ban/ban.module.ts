import { CourseModule } from '@/api/course/course.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    TypeOrmModule.forFeature([WarningEntity, UserBanEntity, UserReportEntity]),
  ],
  controllers: [UserWarningController, BanController, ReportController],
  providers: [WarningService, UserBanService, UserReportService],
})
export class BanModule {}
