import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CategoryModule } from '../category/category.module';
import { CourseModule } from '../course/course.module';
import { PreferenceModule } from '../preference/preference.module';
import { UserModule } from '../user';
import { RecommenderController } from './recommender.controller';
import { RecommenderService } from './recommender.service';

@Module({
  imports: [
    HttpModule,
    UserModule,
    CourseModule,
    CategoryModule,
    PreferenceModule,
  ],
  controllers: [RecommenderController],
  providers: [RecommenderService],
})
export class RecommenderModule {}
