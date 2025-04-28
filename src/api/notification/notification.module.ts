import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponModule } from '@/api/coupon/coupon.module';
import { CourseModule } from '@/api/course/course.module';
import { LectureCommentModule } from '@/api/lecture-comment/lecture-comment.module';
import { UserModule } from '@/api/user/user.module';

import { CourseItemModule } from '../course-item/course-item.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationBuilderService } from './notification-builder.service';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => LectureCommentModule),
    forwardRef(() => CourseItemModule),
    forwardRef(() => CouponModule),
    forwardRef(() => PaymentModule.forRootAsync()),
  ],
  providers: [NotificationService, NotificationBuilderService],
  exports: [NotificationService, NotificationBuilderService],
})
export class NotificationModule {}
