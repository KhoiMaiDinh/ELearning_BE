import { BooleanField, ClassField, DateField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class QuizAttemptRes {
  @Expose()
  @DateField()
  version_date: Date;

  @Expose()
  @StringField()
  get score(): number {
    return this.questions?.filter((q) => q.is_correct).length ?? 0;
  }

  @Expose()
  @ClassField(() => QuizAttemptQuestionRes, { each: true })
  questions: QuizAttemptQuestionRes[];
}

@Exclude()
export class QuizAttemptQuestionRes {
  @Expose()
  @StringField()
  question: string;

  @Expose()
  @BooleanField()
  is_correct: boolean;

  @Expose()
  @ClassField(() => QuizAttemptAnswerRes, { each: true })
  answers: QuizAttemptAnswerRes[];
}

@Exclude()
export class QuizAttemptAnswerRes {
  @Expose()
  @StringField()
  answer: string;

  @Expose()
  @BooleanField()
  is_correct: boolean;

  @Expose()
  @BooleanField()
  is_selected: boolean;
}
