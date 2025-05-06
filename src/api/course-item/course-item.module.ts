import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleController } from '@/api/course-item/article/article.controller';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { ArticleService } from '@/api/course-item/article/article.service';

import { LectureController } from '@/api/course-item/lecture/lecture.controller';
import {
  LectureEntity,
  LectureVideoEntity,
  ResourceEntity,
} from '@/api/course-item/lecture/lecture.entity';
import { LectureRepository } from '@/api/course-item/lecture/lecture.repository';
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

import { CourseProgressModule } from '@/api/course-progress/course-progress.module';
import { EnrolledCourseEntity } from '@/api/course/entities/enrolled-course.entity';
import { LectureCommentModule } from '@/api/lecture-comment/lecture-comment.module';
import { MediaModule } from '@/api/media/media.module';
import { SectionModule } from '@/api/section/section.module';
import { ThreadModule } from '@/api/thread/thread.module';
import { MinioClientModule } from '@/libs/minio';

@Module({
  imports: [
    SectionModule,
    MediaModule,
    MinioClientModule,
    forwardRef(() => LectureCommentModule),
    forwardRef(() => CourseProgressModule),
    forwardRef(() => ThreadModule),
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
  providers: [
    ArticleService,
    QuizService,
    LectureService,
    QuizAttemptService,
    LectureRepository,
  ],
  exports: [LectureRepository],
})
export class CourseItemModule {}
