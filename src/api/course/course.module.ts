import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoryModule } from '@/api/category/category.module';
import { CouponModule } from '@/api/coupon/coupon.module';
import { CourseItemModule } from '@/api/course-item/course-item.module';
import { CourseProgressModule } from '@/api/course-progress/course-progress.module';
import { InstructorModule } from '@/api/instructor/instructor.module';
import { MediaModule } from '@/api/media';
import { PriceModule } from '@/api/price/price.module';
import { SectionModule } from '@/api/section/section.module';
import { UserModule } from '@/api/user/user.module';
import { MinioClientModule } from '@/libs/minio';

import { CertificateController } from '@/api/course/controllers/certificate.controller';
import { CourseController } from '@/api/course/controllers/course.controller';
import { RatingController } from '@/api/course/controllers/rating.controller';
import { CourseUnbanRequestEntity } from '@/api/course/entities/course-unban-request.entity';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { EnrolledCourseEntity } from '@/api/course/entities/enrolled-course.entity';
import { FavoriteCourseEntity } from '@/api/course/entities/favorite-course.entity';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { FavoriteCourseRepository } from '@/api/course/repositories/favorite-course.repository';
import { CertificateService } from '@/api/course/services/certificate.service';
import { CourseModerationService } from '@/api/course/services/course-moderation.service';
import { CourseService } from '@/api/course/services/course.service';
import { EnrollCourseService } from '@/api/course/services/enroll-course.service';
import { FavoriteCourseService } from '@/api/course/services/favorite-course.service';
import { RatingService } from '@/api/course/services/rating.service';
import { BanModule } from '../ban/ban.module';

@Module({
  imports: [
    forwardRef(() =>
      TypeOrmModule.forFeature([
        CourseEntity,
        EnrolledCourseEntity,
        CourseUnbanRequestEntity,
        FavoriteCourseEntity,
      ]),
    ),
    forwardRef(() => UserModule),
    forwardRef(() => CouponModule),
    forwardRef(() => BanModule),
    CouponModule,
    CategoryModule,
    InstructorModule,
    PriceModule,
    MediaModule,
    MinioClientModule,
    forwardRef(() => CourseItemModule),
    forwardRef(() => CourseProgressModule),
    forwardRef(() => SectionModule),
  ],
  controllers: [CourseController, RatingController, CertificateController],
  providers: [
    CourseService,
    CourseRepository,
    EnrollCourseService,
    EnrolledCourseRepository,
    CourseModerationService,
    FavoriteCourseRepository,
    FavoriteCourseService,
    RatingService,
    CertificateService,
  ],
  exports: [
    CourseRepository,
    EnrollCourseService,
    CourseService,
    FavoriteCourseService,
    EnrolledCourseRepository,
    FavoriteCourseRepository,
  ],
})
export class CourseModule {}
