import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
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
  @ManyToOne(() => UserEntity, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user?: Relation<UserEntity>;

  @Column({ type: 'varchar' })
  stripe_account_id: string; // Stripe account ID

  @Column({ type: 'boolean', default: false })
  charges_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  payouts_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  details_submitted: boolean;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @Column({ type: 'varchar' })
  label: string;
}
