import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CouponModule } from '@/api/coupon/coupon.module';
import { CourseModule } from '@/api/course/course.module';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { OrderController } from '@/api/order/order.controller';
import { PaymentModule } from '@/api/payment/payment.module';
import { UserModule } from '@/api/user/user.module';
import { QueueName } from '@/constants';

import { OrderDetailEntity } from './entities/order-detail.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderDetailRepository } from './repositories/order-detail.repository';
import { OrderRepository } from './repositories/order.repository';
import { OrderDetailService } from './services/order-detail.service';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
    forwardRef(() => CouponModule),
    forwardRef(() => PaymentModule.forRootAsync()),
    forwardRef(() =>
      TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity, CourseEntity]),
    ),
    BullModule.registerQueue({
      name: QueueName.ORDER,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
    OrderDetailService,
    OrderDetailRepository,
  ],
  exports: [
    OrderService,
    OrderRepository,
    OrderDetailService,
    OrderDetailRepository,
  ],
})
export class OrderModule {}
