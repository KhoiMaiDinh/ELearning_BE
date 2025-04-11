import { CourseEntity } from '@/api/course/entities/course.entity';
import { OrderEntity } from '@/api/order/entities/order.entity';
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

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  final_price: number;

  @ManyToOne(() => OrderEntity, (order) => order.details)
  @JoinColumn({ name: 'order_id' })
  order: Relation<OrderEntity>;

  @ManyToOne(() => CourseEntity, (course) => course.order_details)
  @JoinColumn({ name: 'course_id' })
  course: Relation<CourseEntity>;
}
