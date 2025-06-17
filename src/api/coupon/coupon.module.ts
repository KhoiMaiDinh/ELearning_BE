import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseModule } from '@/api/course/course.module';
import { InstructorModule } from '@/api/instructor/instructor.module';
import { OrderModule } from '@/api/order/order.module';
import { UserModule } from '@/api/user/user.module';

import { CouponController } from './coupon.controller';
import { CouponRepository } from './coupon.repository';
import { CouponService } from './coupon.service';
import { CouponEntity } from './entities/coupon.entity';

@Module({
  imports: [
    forwardRef(() => CourseModule),
    forwardRef(() => OrderModule),
    forwardRef(() => UserModule),
    InstructorModule,
    forwardRef(() => TypeOrmModule.forFeature([CouponEntity])),
  ],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository],
  exports: [CouponService, CouponRepository],
})
export class CouponModule {}
