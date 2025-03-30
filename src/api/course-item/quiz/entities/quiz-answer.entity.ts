import { Nanoid, Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { QuizQuestionEntity } from './quiz-question.entity';

@Entity('quiz-answer')
export class QuizAnswerEntity extends AbstractEntity {
  constructor(partial?: Partial<QuizAnswerEntity>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quiz_answer_id',
  })
  quiz_answer_id: Uuid;

  @Index('EQ_quiz_answer_id', { unique: true })
  @Column({ type: 'varchar', length: 13 })
  @AutoNanoId(13)
  id: Nanoid;

  @Column({ type: 'varchar' })
  answer: string;

  @Column({ type: 'boolean', default: false })
  is_correct: boolean;

  // relations

  @Column({ type: 'uuid' })
  quiz_question_id: Uuid;
  @ManyToOne(() => QuizQuestionEntity, (question) => question.answers)
  @JoinColumn({ name: 'quiz_question_id' })
  question: Relation<QuizQuestionEntity>;
}
