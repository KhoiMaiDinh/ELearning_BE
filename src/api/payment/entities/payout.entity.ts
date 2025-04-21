import { MediaEntity } from '@/api/media/entities/media.entity';
import { OrderDetailEntity } from '@/api/order/entities/order-detail.entity';
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
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PayoutStatus } from '../enums/payment-status.enum';

@Entity('payout')
export class PayoutEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  payout_id: Uuid;

  @Column({ type: 'varchar' })
  @AutoNanoId(13)
  @Index('EK_payout_id', { unique: true })
  id: Nanoid;

  @Column({ type: 'uuid' })
  payee_id: Uuid;
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'payee_id', referencedColumnName: 'user_id' })
  payee: Relation<UserEntity>;

  @Column({ type: 'varchar', nullable: true })
  transfer_id: string;

  @Column({ type: 'timestamptz', nullable: true })
  paid_out_sent_at: Date | null;

  @Column({ type: 'varchar' })
  bank_account_number: string;

  @Column({ type: 'varchar' })
  bank_code: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PayoutStatus, nullable: true })
  payout_status: PayoutStatus;

  @Column({ nullable: true })
  failure_reason?: string;

  @Column('uuid', { nullable: true })
  evidence_id: Uuid;
  @OneToOne(() => MediaEntity)
  @JoinColumn({ name: 'evidence_id', referencedColumnName: 'media_id' })
  evidence: Relation<MediaEntity>;

  @OneToMany(() => OrderDetailEntity, (detail) => detail.payout)
  details: Relation<OrderDetailEntity[]>;
}
