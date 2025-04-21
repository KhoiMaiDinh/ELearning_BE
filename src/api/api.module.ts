import { AuthModule } from '@/api/auth/auth.module';
import { CategoryModule } from '@/api/category/category.module';
import { CourseItemModule } from '@/api/course-item/course-item.module';
import { CourseModule } from '@/api/course/course.module';
import { HealthModule } from '@/api/health/health.module';
import { HomeModule } from '@/api/home/home.module';
import { InstructorModule } from '@/api/instructor/instructor.module';
import { MediaModule } from '@/api/media/media.module';
import { OrderModule } from '@/api/order/order.module';
import { PaymentModule } from '@/api/payment/payment.module';
import { PostModule } from '@/api/post/post.module';
import { PreferenceModule } from '@/api/preference/preference.module';
import { PriceModule } from '@/api/price/price.module';
import { RoleModule } from '@/api/role/role.module';
import { SectionModule } from '@/api/section/section.module';
import { UserModule } from '@/api/user/user.module';
import { Module } from '@nestjs/common';
import { CouponModule } from './coupon/coupon.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    UserModule,
    HealthModule,
    AuthModule,
    HomeModule,
    PostModule,
    RoleModule,
    InstructorModule,
    MediaModule,
    CategoryModule,
    PreferenceModule,
    CourseModule,
    CourseItemModule,
    SectionModule,
    PriceModule,
    PaymentModule.forRootAsync(),
    OrderModule,
    WebhookModule.forRootAsync(),
    CouponModule,
  ],
})
export class ApiModule {}
