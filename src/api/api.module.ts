import { AuthModule } from '@/api/auth/auth.module';
import { CategoryModule } from '@/api/category/category.module';
import { CouponModule } from '@/api/coupon/coupon.module';
import { CourseItemModule } from '@/api/course-item/course-item.module';
import { CourseProgressModule } from '@/api/course-progress/course-progress.module';
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
import { WebhookModule } from '@/api/webhook/webhook.module';
import { Module } from '@nestjs/common';
import { BanModule } from './ban/ban.module';
import { LectureCommentModule } from './lecture-comment/lecture-comment.module';
import { NotificationModule } from './notification/notification.module';
import { RecommenderModule } from './recommender/recommender.module';
import { ThreadModule } from './thread/thread.module';

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
    CourseProgressModule,
    LectureCommentModule,
    NotificationModule,
    ThreadModule,
    BanModule,
    RecommenderModule,
  ],
})
export class ApiModule {}
