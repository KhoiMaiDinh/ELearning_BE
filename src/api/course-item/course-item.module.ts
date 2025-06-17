import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticleController } from '@/api/course-item/article/article.controller';
import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { ArticleService } from '@/api/course-item/article/article.service';

import { LectureSeriesEntity } from '@/api/course-item/lecture/entities/lecture-series.entity';
import { LectureEntity } from '@/api/course-item/lecture/entities/lecture.entity';
import { ResourceEntity } from '@/api/course-item/lecture/entities/resource.entity';
import { LectureController } from '@/api/course-item/lecture/lecture.controller';
import { LectureService } from '@/api/course-item/lecture/lecture.service';
import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';

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
import { CourseModule } from '@/api/course/course.module';
import { EnrolledCourseEntity } from '@/api/course/entities/enrolled-course.entity';
import { LectureCommentModule } from '@/api/lecture-comment/lecture-comment.module';
import { MediaModule } from '@/api/media/media.module';
import { SectionModule } from '@/api/section/section.module';
import { ThreadModule } from '@/api/thread/thread.module';
import { MinioClientModule } from '@/libs/minio';
import { LectureSeriesRepository } from './lecture/repositories/lecture-series.repository';

@Module({
  imports: [
    SectionModule,
    MediaModule,
    MinioClientModule,
    forwardRef(() => CourseModule),
    forwardRef(() => LectureCommentModule),
    forwardRef(() => CourseProgressModule),
    forwardRef(() => ThreadModule),
    forwardRef(() =>
      TypeOrmModule.forFeature([
        EnrolledCourseEntity,
        ArticleEntity,
        QuizEntity,
        ResourceEntity,
        LectureSeriesEntity,
        LectureEntity,
        QuizQuestionEntity,
        QuizAnswerEntity,
        QuizAttempt,
        QuizAttemptQuestion,
      ]),
    ),
  ],
  controllers: [ArticleController, QuizController, LectureController],
  providers: [
    ArticleService,
    QuizService,
    LectureService,
    QuizAttemptService,
    LectureRepository,
    LectureSeriesRepository,
  ],
  exports: [LectureRepository, LectureSeriesRepository],
})
export class CourseItemModule {}
