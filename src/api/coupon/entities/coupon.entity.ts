import { CourseEntity } from '@/api/course/entities/course.entity';
import { OrderDetailEntity } from '@/api/order/entities/order-detail.entity';
import { Uuid } from '@/common';
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
import { CouponType } from '../enum/coupon-type.enum';

@Entity('coupon')
export class CouponEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  coupon_id: Uuid;

  @Column({ type: 'varchar' })
  @AutoNanoId(13)
  @Index('UQ_coupon_code', { unique: true })
  code: string;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'timestamp' })
  starts_at?: Date;

  @Column({ type: 'timestamp' })
  expires_at?: Date;

  @Column({ type: 'int', nullable: true })
  usage_limit?: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  course_id?: Uuid;

  @ManyToOne(() => CourseEntity, { nullable: true })
  @JoinColumn({ name: 'course_id' })
  course?: CourseEntity;

  // relation with OrderDetail
  @OneToMany(() => OrderDetailEntity, (orderDetail) => orderDetail.coupon)
  order_details?: Relation<OrderDetailEntity[]>;
}
