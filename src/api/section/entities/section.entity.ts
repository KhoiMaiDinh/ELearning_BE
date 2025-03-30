import { ArticleEntity } from '@/api/course-item/article/article.entity';
import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
import { QuizEntity } from '@/api/course-item/quiz/entities/quiz.entity';
import { CourseEntity } from '@/api/course/entities/course.entity';
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

@Entity('section')
export class SectionEntity extends AbstractEntity {
  constructor(data?: Partial<SectionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_section_id' })
  section_id: Uuid;

  @Index('EK_section_id', { unique: true })
  @Column({ type: 'varchar', length: 13 })
  @AutoNanoId(13)
  id: Nanoid;

  @Column({ type: 'varchar', length: 60 })
  title: string;

  @Column({ type: 'varchar' })
  position: string;

  // relations
  @Column({ type: 'uuid' })
  course_id: Uuid;
  @ManyToOne(() => CourseEntity, (course) => course.sections)
  @JoinColumn({ name: 'course_id' })
  course: Relation<CourseEntity>;

  @OneToMany(() => LectureEntity, (item) => item.section, {
    onDelete: 'CASCADE',
  })
  lectures: Relation<LectureEntity[]>;

  @OneToMany(() => QuizEntity, (item) => item.section, {
    onDelete: 'CASCADE',
  })
  quizzes: Relation<QuizEntity[]>;

  @OneToMany(() => ArticleEntity, (item) => item.section, {
    onDelete: 'CASCADE',
  })
  articles: Relation<ArticleEntity[]>;
}
