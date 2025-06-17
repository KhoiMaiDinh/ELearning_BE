import { CourseEntity } from '@/api/course/entities/course.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { UserBanEntity } from './user-ban.entity';
import { UserReportEntity } from './user-report.entity';

@Entity('warning')
export class WarningEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  warning_id: Uuid;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;
  @Column('uuid')
  user_id: Uuid;

  @ManyToOne(() => UserBanEntity, (user_ban) => user_ban.warnings)
  @JoinColumn({ name: 'ban_id' })
  ban: Relation<UserBanEntity>;
  @Column('uuid', { nullable: true })
  ban_id: Uuid;

  @OneToOne(() => UserReportEntity, { nullable: true })
  @JoinColumn({ name: 'user_report_id' })
  report: Relation<UserReportEntity>;
  @Column('uuid', { nullable: true })
  user_report_id: Uuid;
  // ============ COURSE WARNING ==============
  @ManyToOne(() => CourseEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Relation<CourseEntity>;

  @Column('uuid', { nullable: true })
  course_id: Uuid;

  @Column('boolean', { nullable: true })
  is_resolved: boolean;

  @Column('timestamptz', { nullable: true })
  resolved_at: Date;
  // ============ COURSE WARNING ==============
}
