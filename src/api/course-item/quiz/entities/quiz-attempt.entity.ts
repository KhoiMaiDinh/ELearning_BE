import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

export type QuizAttemptAnswer = {
  answer: string;
  is_correct: boolean;
  is_selected: boolean;
};

@Entity('quiz-attempt')
export class QuizAttempt extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quiz_attempt_id',
  })
  quiz_attempt_id: Uuid;

  @Column({ type: 'uuid' })
  user_id: Uuid;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column({ type: 'uuid' })
  quiz_id: Uuid;
  @ManyToOne(() => QuizEntity, (quiz) => quiz.attempts, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Relation<QuizEntity>;

  @Column({ type: 'timestamptz' })
  version_date: Date;

  @OneToMany(() => QuizAttemptQuestion, (question) => question.attempt, {
    cascade: true,
  })
  questions: Relation<QuizAttemptQuestion[]>;

  score: string;
}

@Entity('quiz-attempt-question')
export class QuizAttemptQuestion extends AbstractEntity {
  constructor(partial?: Partial<QuizAttemptQuestion>) {
    super();
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quiz_attempt_question_id',
  })
  quiz_attempt_question_id: Uuid;

  @Column({ type: 'uuid' })
  quiz_attempt_id: Uuid;
  @ManyToOne(() => QuizAttempt, (attempt) => attempt.questions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_attempt_id' })
  attempt: Relation<QuizAttempt>;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'jsonb' })
  answers: QuizAttemptAnswer[];

  @Column({ type: 'boolean' })
  is_correct: boolean;
}
