import { AuthModule } from '@/api/auth/auth.module';
import { CategoryModule } from '@/api/category/category.module';
import { CourseModule } from '@/api/course/course.module';
import { HealthModule } from '@/api/health/health.module';
import { HomeModule } from '@/api/home/home.module';
import { InstructorModule } from '@/api/instructor/instructor.module';
import { MediaModule } from '@/api/media/media.module';
import { PostModule } from '@/api/post/post.module';
import { PreferenceModule } from '@/api/preference/preference.module';
import { RoleModule } from '@/api/role/role.module';
import { UserModule } from '@/api/user/user.module';
import { Module } from '@nestjs/common';

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
  ],
})
export class ApiModule {}
