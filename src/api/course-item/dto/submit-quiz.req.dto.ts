import { Nanoid } from '@/common';
import { ClassField, StringField } from '@/decorators';
import { ArrayMinSize } from 'class-validator';

export class SubmitQuizReq {
  @ClassField(() => SubmitQuizQuestionReq, { each: true })
  questions: SubmitQuizQuestionReq[];
}

export class SubmitQuizQuestionReq {
  @StringField()
  id: Nanoid;

  @StringField({ each: true })
  @ArrayMinSize(1)
  answer_ids: Nanoid[];
}
