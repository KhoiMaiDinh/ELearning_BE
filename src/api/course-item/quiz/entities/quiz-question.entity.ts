import { QuizQuestionType } from '@/api/course-item/course-item.enum';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { Nanoid, Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { QuizAnswerEntity } from './quiz-answer.entity';

@Entity('quiz-question')
export class QuizQuestionEntity extends AbstractEntity {
  constructor(partial?: Partial<QuizQuestionEntity>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quiz_question_id',
  })
  quiz_question_id: Uuid;

  @Index('EQ_quiz_question_id', { unique: true })
  @Column({ type: 'varchar', length: 13 })
  @AutoNanoId(13)
  id: Nanoid;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'enum', enum: QuizQuestionType })
  type: QuizQuestionType;

  // relations

  @Column({ type: 'uuid' })
  quiz_id: Uuid;
  @ManyToOne(() => QuizEntity, (quiz) => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Relation<QuizEntity>;

  @OneToMany(() => QuizAnswerEntity, (answer) => answer.question, {
    cascade: true,
  })
  answers: Relation<QuizAnswerEntity[]>;
}
