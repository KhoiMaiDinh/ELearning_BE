import { CourseEntity } from '@/api/course/entities/course.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { ENTITY as E } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoCertificateCode } from '@/decorators';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';

@Entity(E.ENROLLED_COURSE)
@Index('idx_certificate_code_unique', ['certificate_code'], { unique: true })
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
  reviewed_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  last_viewed_at: Date;

  @Column({ type: 'boolean', default: false })
  is_completed: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  @AutoCertificateCode({ prefix: 'CERT', length: 8 })
  certificate_code: string | null;
}
