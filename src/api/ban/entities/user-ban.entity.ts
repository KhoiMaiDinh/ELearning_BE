import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { WarningEntity } from './warning.entity';

@Entity('user_bans')
export class UserBanEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  ban_id: Uuid;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: Relation<UserEntity>;

  @Column('timestamptz', { nullable: true })
  expires_at: Date | null; // null means permanent ban

  @Column('boolean', { default: true })
  is_active: boolean;

  @OneToMany(() => WarningEntity, (warning) => warning.ban)
  warnings: Relation<WarningEntity[]>;
}
