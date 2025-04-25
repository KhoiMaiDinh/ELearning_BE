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
import { ResourceReq } from './resource.req.dto';

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

export class LectureVideoReq extends MediaReq {
  @NumberField({ int: true, isPositive: true })
  duration_in_seconds: number;
}

export class CreateLectureReq extends CreateCourseItemReq {
  @ClassField(() => LectureVideoReq)
  video: LectureVideoReq;

  @StringFieldOptional({ maxLength: 300 })
  description: string;
  @ClassFieldOptional(() => ResourceReq, { each: true })
  resources: ResourceReq[];
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
