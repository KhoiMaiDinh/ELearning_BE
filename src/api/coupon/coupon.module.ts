import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderModule } from '@/api/order/order.module';

import { CourseModule } from '../course/course.module';
import { CouponController } from './coupon.controller';
import { CouponRepository } from './coupon.repository';
import { CouponService } from './coupon.service';
import { CouponEntity } from './entities/coupon.entity';

@Module({
  imports: [
    CourseModule,
    forwardRef(() => OrderModule),
    TypeOrmModule.forFeature([CouponEntity]),
  ],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository],
  exports: [CouponService, CouponRepository],
})
export class CouponModule {}
