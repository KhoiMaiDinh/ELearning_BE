import { MediaRes } from '@/api/media';
import { SectionRes } from '@/api/section';
import { Nanoid } from '@/common';
import {
  BooleanField,
  ClassField,
  ClassFieldOptional,
  EnumField,
  NumberField,
  StringField,
  StringFieldOptional,
} from '@/decorators';
import { IntersectionType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { QuizQuestionType } from '../course-item.enum';

@Exclude()
export class CourseItemRes {
  @Expose()
  @StringField()
  title: string;

  @Expose()
  @StringField()
  position: Nanoid;

  @Expose()
  @BooleanField()
  is_preview: boolean;

  @Expose()
  @ClassFieldOptional(() => SectionRes)
  section?: SectionRes;
}

@Exclude()
export class LectureRes extends CourseItemRes {
  @Expose()
  @ClassField(() => MediaRes)
  video: MediaRes;

  @Expose()
  @StringFieldOptional()
  description: string;

  @Expose()
  @NumberField()
  video_duration: number;

  @Expose()
  @ClassFieldOptional(() => MediaRes)
  resource: MediaRes;
}

@Exclude()
export class QuizRes extends CourseItemRes {
  @Expose()
  @StringFieldOptional()
  description: string;

  @Expose()
  @ClassField(() => QuizQuestionRes, { each: true })
  questions: QuizQuestionRes[];
}

@Exclude()
export class ArticleRes {
  @Expose()
  @StringField({ isHtml: true })
  content: string;
}

@Exclude()
export class QuizQuestionRes {
  @Expose()
  @StringField()
  id: Nanoid;

  @Expose()
  @StringField()
  question: string;

  @Expose()
  @EnumField(() => QuizQuestionType)
  type: QuizQuestionType;

  @Expose()
  @ClassField(() => QuizAnswerRes, { each: true })
  answers: QuizAnswerRes[];
}

@Exclude()
export class QuizAnswerRes {
  @Expose()
  @StringField()
  id: Nanoid;

  @Expose()
  @StringField()
  answer: string;

  @Expose()
  @BooleanField()
  is_correct: boolean;
}

export class CourseItemDetailRes extends IntersectionType(
  LectureRes,
  QuizRes,
  ArticleRes,
) {}
