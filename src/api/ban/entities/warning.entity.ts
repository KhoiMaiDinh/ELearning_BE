import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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
  user: Relation<UserEntity>;

  @ManyToOne(() => UserBanEntity, (user_ban) => user_ban.warnings)
  @JoinColumn({ name: 'ban_id' })
  ban: Relation<UserBanEntity>;
  @Column('uuid', { nullable: true })
  ban_id: Uuid;

  @ManyToOne(() => UserReportEntity, { nullable: true })
  report: Relation<UserReportEntity>;
}
