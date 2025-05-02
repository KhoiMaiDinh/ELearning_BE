import { UserEntity } from '@/api/user/entities/user.entity';
import { Nanoid, Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { WarningType } from '../enum/warning-type.enum';

@Entity('user_report')
export class UserReportEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  user_report_id: Uuid;

  @Index('EK_user_report_id', {
    unique: true,
  })
  @Column('varchar')
  @AutoNanoId(13)
  id: Nanoid;

  @ManyToOne(() => UserEntity)
  reporter: Relation<UserEntity>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column('enum', { enum: WarningType })
  type: WarningType;

  @Column('varchar')
  reason: string;

  @Column('boolean', { default: false })
  is_reviewed: boolean;

  @Column('boolean', { default: false })
  is_valid: boolean;
}
