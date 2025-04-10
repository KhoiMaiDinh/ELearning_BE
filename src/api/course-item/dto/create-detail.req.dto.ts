import { MediaReq } from '@/api/media';
import { SectionReq } from '@/api/section';
import {
  BooleanField,
  ClassField,
  ClassFieldOptional,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
} from '@/decorators';
import { QuizQuestionType } from '../course-item.enum';

export class CreateCourseItemReq {
  @StringField()
  title: string;

  @StringField({ nullable: true })
  previous_position: string | null;

  @BooleanField()
  is_preview: boolean;

  @ClassField(() => SectionReq)
  section: SectionReq;
}

export class CreateLectureReq extends CreateCourseItemReq {
  @ClassField(() => MediaReq)
  video: MediaReq;
  @StringFieldOptional({ maxLength: 300 })
  description: string;
  @NumberField()
  video_duration: number;
  @ClassFieldOptional(() => MediaReq)
  resource: MediaReq;
}

export class CreateArticleReq extends CreateCourseItemReq {
  @StringField({ isHtml: true })
  content: string;
}

export class CreateQuizReq extends CreateCourseItemReq {
  @StringFieldOptional({ maxLength: 300 })
  description: string;

  @ClassField(() => CreateQuizQuestionReq, { each: true })
  questions: CreateQuizQuestionReq[];
}

export class CreateQuizQuestionReq {
  @StringField({ isHtml: true })
  question: string;
  @EnumField(() => QuizQuestionType)
  type: QuizQuestionType;

  @ClassField(() => CreateQuizAnswerReq, { each: true })
  answers: CreateQuizAnswerReq[];
}

export class CreateQuizAnswerReq {
  @StringField()
  answer: string;
  @BooleanField()
  is_correct: boolean;
}
