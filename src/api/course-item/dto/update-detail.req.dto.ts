import { Nanoid } from '@/common';
import {
  ClassField,
  ClassFieldOptional,
  StringFieldOptional,
} from '@/decorators';
import { OmitType, PartialType } from '@nestjs/swagger';
import {
  CreateArticleReq,
  CreateLectureReq,
  CreateQuizAnswerReq,
  CreateQuizQuestionReq,
  CreateQuizReq,
} from './create-detail.req.dto';

export class UpdateLectureReq extends PartialType(CreateLectureReq) {}
export class UpdateArticleReq extends CreateArticleReq {}
export class UpdateQuizReq extends OmitType(CreateQuizReq, ['questions']) {
  @ClassFieldOptional(() => UpdateQuizQuestionReq, { each: true }) // Not provide -> Not change
  questions: UpdateQuizQuestionReq[];
}

export class UpdateQuizQuestionReq extends CreateQuizQuestionReq {
  @StringFieldOptional() // Optional to support new questions without an ID
  id?: Nanoid;

  @ClassField(() => UpdateQuizAnswerReq, { each: true })
  declare answers: UpdateQuizAnswerReq[];
}

export class UpdateQuizAnswerReq extends CreateQuizAnswerReq {
  @StringFieldOptional() // Optional to support new answers without an ID
  id?: Nanoid;
}
