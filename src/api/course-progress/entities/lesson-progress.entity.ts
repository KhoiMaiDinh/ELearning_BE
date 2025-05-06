import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { Entity as E } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity(E.USER_LESSON_PROGRESS)
export class UserLessonProgressEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  user_lesson_progress_id: Uuid;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;
  @Column('uuid')
  user_id: Uuid;

  @ManyToOne(() => LectureEntity, (lecture) => lecture.progresses)
  @JoinColumn({ name: 'lecture_id' })
  lecture: Relation<LectureEntity>;

  @Column('uuid')
  lecture_id: Uuid;

  @ManyToOne(() => CourseEntity)
  @JoinColumn({ name: 'course_id' })
  course: Relation<CourseEntity>;

  @Column('uuid')
  course_id: Uuid;

  @Column({ type: 'float', default: 0 })
  watch_time_in_percentage: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;
}
