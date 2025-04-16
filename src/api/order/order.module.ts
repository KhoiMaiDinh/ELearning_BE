import { PaymentModule } from '@/api/payment/payment.module';
import { UserModule } from '@/api/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseModule } from '../course/course.module';
import { CourseEntity } from '../course/entities/course.entity';
import { OrderController } from '../order/order.controller';
import { OrderDetailEntity } from './entities/order-detail.entity';
import { OrderEntity } from './entities/order.entity';
import { OrderService } from './services/order.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity, CourseEntity]),
    forwardRef(() => PaymentModule.forRootAsync()),
    CourseModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
