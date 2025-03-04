import { UserModule } from '@/api/user';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CourseModule } from './course/course.module';
import { HealthModule } from './health/health.module';
import { HomeModule } from './home/home.module';
import { InstructorModule } from './instructor/instructor.module';
import { MediaModule } from './media/media.module';
import { PostModule } from './post/post.module';
import { PreferenceModule } from './preference/preference.module';
import { RoleModule } from './role/role.module';

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
