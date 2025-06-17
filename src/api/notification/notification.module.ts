import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponModule } from '@/api/coupon/coupon.module';
import { CourseItemModule } from '@/api/course-item/course-item.module';
import { CourseModule } from '@/api/course/course.module';
import { LectureCommentModule } from '@/api/lecture-comment/lecture-comment.module';
import { PaymentModule } from '@/api/payment/payment.module';
import { ThreadModule } from '@/api/thread/thread.module';
import { UserModule } from '@/api/user/user.module';

import { NotificationEntity } from './entities/notification.entity';
import { NotificationBuilderService } from './notification-builder.service';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => LectureCommentModule),
    forwardRef(() => CourseItemModule),
    forwardRef(() => CouponModule),
    forwardRef(() => ThreadModule),
    forwardRef(() => PaymentModule.forRootAsync()),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationBuilderService],
  exports: [NotificationService, NotificationBuilderService],
})
export class NotificationModule {}
