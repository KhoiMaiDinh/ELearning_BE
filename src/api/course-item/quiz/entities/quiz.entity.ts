import { QuizQuestionEntity } from '@/api/course-item/quiz/entities/quiz-question.entity';
import { SectionEntity } from '@/api/section/entities/section.entity';
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
import { QuizAttempt } from './quiz-attempt.entity';

@Entity('quiz')
export class QuizEntity extends AbstractEntity {
  constructor(partial?: Partial<QuizEntity>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_quiz_id',
  })
  quiz_id: Uuid;

  // common props
  @Index('EQ_quiz_id', { unique: true })
  @Column({ type: 'varchar', length: 13 })
  @AutoNanoId(13)
  id: Nanoid;

  @Column({ type: 'varchar', length: 60 })
  title: string;

  @Column({ type: 'varchar' })
  position: string;

  @Column({ type: 'boolean', default: false })
  is_preview: boolean;

  // relations

  @Column({ type: 'uuid' })
  section_id: Uuid;
  @ManyToOne(() => SectionEntity, (section) => section.quizzes)
  @JoinColumn({ name: 'section_id' })
  section: Relation<SectionEntity>;

  @OneToMany(() => QuizQuestionEntity, (question) => question.quiz, {
    cascade: true,
  })
  questions: Relation<QuizQuestionEntity[]>;

  @OneToMany(() => QuizAttempt, (attempt) => attempt.quiz)
  attempts: Relation<QuizAttempt[]>;

  // unique props
  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  update_content_at: Date;

  @Column({ type: 'varchar' })
  description: string;
}
