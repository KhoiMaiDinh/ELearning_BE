import { PaymentModule } from '@/api/payment/payment.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../course/entities/course.entity';
import { OrderController } from '../order/order.controller';
import { UserEntity } from '../user/entities/user.entity';
import { OrderDetailEntity } from './entities/order-detail.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderDetailEntity,
      CourseEntity,
      UserEntity,
    ]),
    forwardRef(() => PaymentModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
