import { UserEntity } from '@/api/user/entities/user.entity';
import { Nanoid, Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { NotificationType } from '../enum/notification-type.enum';

@Entity('notification')
export class NotificationEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  notification_id: Uuid;

  @Column('varchar')
  @Index('EK_NOTIFICATION_ID', { unique: true })
  @AutoNanoId()
  id: Nanoid;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column('uuid')
  user_id: Uuid;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;
}
