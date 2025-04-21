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
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PaymentCurrency } from '../../payment/enums/payment-currency.enum';
import { PaymentProvider } from '../../payment/enums/payment-provider.enum';
import { PaymentStatus } from '../../payment/enums/payment-status.enum';

@Entity('order')
export class OrderEntity extends AbstractEntity {
  constructor(data?: Partial<OrderEntity>) {
    super();
    Object.assign(this, data);
  }
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_order_id' })
  order_id: Uuid;

  @Column({ type: 'varchar', length: 13 })
  @AutoNanoId(13)
  @Index('EK_order_id', { unique: true })
  id: Nanoid;

  @Column({ type: 'uuid' })
  user_id: Uuid;

  @Column({ type: 'varchar', length: 15, nullable: true })
  transaction_id?: string | number; // transaction id from payment provider

  @Column({ type: 'varchar', nullable: true })
  payment_intent_id?: string;

  @Column('decimal', { precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'enum', enum: PaymentCurrency })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({ type: 'timestamptz' })
  expired_at: Date;

  // relations
  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @OneToMany(() => OrderDetailEntity, (item) => item.order, {
    cascade: true,
  })
  details: Relation<OrderDetailEntity[]>;
}
