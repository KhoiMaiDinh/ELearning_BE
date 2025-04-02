import { ArticleController } from '@/api/course-item/article/article.controller';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { ArticleService } from '@/api/course-item/article/article.service';
import { LectureController } from '@/api/course-item/lecture/lecture.controller';
import {
  LectureEntity,
  LectureVideoEntity,
  ResourceEntity,
} from '@/api/course-item/lecture/lecture.entity';
import { LectureService } from '@/api/course-item/lecture/lecture.service';
import { QuizAnswerEntity } from '@/api/course-item/quiz/entities/quiz-answer.entity';
import {
  QuizAttempt,
  QuizAttemptQuestion,
} from '@/api/course-item/quiz/entities/quiz-attempt.entity';
import { QuizQuestionEntity } from '@/api/course-item/quiz/entities/quiz-question.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { QuizAttemptService } from '@/api/course-item/quiz/quiz-attempt.service';
import { QuizController } from '@/api/course-item/quiz/quiz.controller';
import { QuizService } from '@/api/course-item/quiz/quiz.service';
import { MediaModule } from '@/api/media';
import { SectionModule } from '@/api/section/section.module';
import { MinioClientModule } from '@/libs/minio';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrolledCourseEntity } from '../course/entities/enrolled-course.entity';

@Module({
  imports: [
    SectionModule,
    MediaModule,
    MinioClientModule,
    TypeOrmModule.forFeature([
      EnrolledCourseEntity,
      ArticleEntity,
      QuizEntity,
      ResourceEntity,
      LectureVideoEntity,
      LectureEntity,
      QuizQuestionEntity,
      QuizAnswerEntity,
      QuizAttempt,
      QuizAttemptQuestion,
    ]),
  ],
  controllers: [ArticleController, QuizController, LectureController],
  providers: [ArticleService, QuizService, LectureService, QuizAttemptService],
})
export class CourseItemModule {}
