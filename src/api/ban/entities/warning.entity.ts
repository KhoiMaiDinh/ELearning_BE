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
}
