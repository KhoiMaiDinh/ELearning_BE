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
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity(E.ENROLLED_COURSE)
export class EnrolledCourseEntity extends AbstractEntity {
  @ManyToOne(() => CourseEntity, (course) => course.enrolled_users)
  @JoinColumn({ name: 'course_id' })
  course?: Relation<CourseEntity>;
  @PrimaryColumn('uuid')
  course_id: Uuid;

  @ManyToOne(() => UserEntity, (user) => user.enrolled_courses)
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;
  @PrimaryColumn('uuid')
  user_id: Uuid;

  @Column({ type: 'boolean', default: false })
  is_refunded: boolean;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  rating_comment: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_viewed_at: Date;
}
