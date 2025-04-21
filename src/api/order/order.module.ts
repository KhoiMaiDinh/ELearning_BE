import { PaymentModule } from '@/api/payment/payment.module';
import { UserModule } from '@/api/user/user.module';
import { QueueName } from '@/constants';
import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from '../course/course.module';
import { CourseEntity } from '../course/entities/course.entity';
import { OrderController } from '../order/order.controller';
import { OrderDetailEntity } from './entities/order-detail.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderDetailService } from './services/order-detail.service';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity, CourseEntity]),
    forwardRef(() => PaymentModule.forRootAsync()),
    CourseModule,
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
  providers: [OrderService, OrderDetailService],
  exports: [OrderService, OrderDetailService],
})
export class OrderModule {}
