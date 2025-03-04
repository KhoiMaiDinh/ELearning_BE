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

@Entity('session')
export class SessionEntity extends AbstractEntity {
  constructor(data?: Partial<SessionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_session_id',
  })
  id!: Uuid;

  @Column({
    name: 'hash',
    type: 'varchar',
    length: 255,
  })
  hash!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  user_id: Uuid;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'user_id',
    foreignKeyConstraintName: 'FK_session_user',
  })
  @ManyToOne(() => UserEntity, (user) => user.sessions)
  user!: Relation<UserEntity>;
}
