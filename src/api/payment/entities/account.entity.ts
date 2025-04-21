import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { Column } from 'typeorm';

@Entity('account')
export class AccountEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'pk_account_id' })
  account_id: Uuid;

  @Column('uuid')
  user_id: Uuid;
  @OneToOne(() => UserEntity, (user) => user.account)
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  bank_account_number: string;

  @Column({ type: 'varchar' })
  bank_code: string;
}
