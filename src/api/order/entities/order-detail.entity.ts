import { CouponEntity } from '@/api/coupon/entities/coupon.entity';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { OrderEntity } from '@/api/order/entities/order.entity';
import { PayoutEntity } from '@/api/payment/entities/payout.entity';
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

@Entity('order-detail')
export class OrderDetailEntity extends AbstractEntity {
  constructor(data?: Partial<OrderDetailEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_order_detail_id',
  })
  order_detail_id: Uuid;

  @Column({ type: 'uuid' })
  order_id: Uuid;

  @Column({ type: 'uuid' })
  course_id: Uuid;

  // details
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  final_price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  platform_fee: number;

  // payment infos
  // @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
  // payout_status: string;

  @Column({ type: 'timestamptz', nullable: true })
  payout_due_at: Date | null;

  @ManyToOne(() => OrderEntity, (order) => order.details)
  @JoinColumn({ name: 'order_id' })
  order: Relation<OrderEntity>;

  @ManyToOne(() => CourseEntity)
  @JoinColumn({ name: 'course_id' })
  course: Relation<CourseEntity>;

  @ManyToOne(() => PayoutEntity, (payout) => payout.details, {
    nullable: true,
  })
  @JoinColumn({ name: 'payout_id' })
  payout: Relation<PayoutEntity>;
  @Column({ nullable: true })
  payout_id: string;

  @ManyToOne(() => CouponEntity, (coupon) => coupon.order_details, {
    nullable: true,
  })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Relation<OrderDetailEntity>;
  @Column({ type: 'uuid', nullable: true })
  coupon_id: Uuid;
}
