import { CourseEntity } from '@/api/course/entities/course.entity';
import { OrderDetailEntity } from '@/api/order/entities/order-detail.entity';
import { Nanoid, Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoCouponCode } from '@/decorators/coupon-code.decorator';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  VirtualColumn,
} from 'typeorm';
import { CouponType } from '../enum/coupon-type.enum';

@Entity('coupon')
export class CouponEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  coupon_id: Uuid;

  @Column({ type: 'varchar' })
  @AutoCouponCode({ prefix: 'CPN', length: 10 })
  @Index('UQ_coupon_code', { unique: true })
  code: Nanoid;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'timestamp' })
  starts_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;

  @Column({ type: 'int', nullable: true })
  usage_limit?: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'uuid', nullable: true })
  course_id?: Uuid;

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @ManyToOne(() => CourseEntity, (course) => course.coupons, { nullable: true })
  @JoinColumn({ name: 'course_id' })
  course?: Relation<CourseEntity>;

  @OneToMany(() => OrderDetailEntity, (orderDetail) => orderDetail.coupon)
  order_details?: Relation<OrderDetailEntity[]>;

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*) FROM "order-detail" WHERE "order-detail"."coupon_id" = "${alias}.coupon_id"`,
  })
  usage_count?: number;

  @VirtualColumn({
    type: 'decimal',
    query: (alias) =>
      `SELECT SUM("order-detail"."final_price") FROM "order-detail" WHERE "order-detail"."coupon_id" = "${alias}.coupon_id"`,
  })
  total_revenue?: number;
}
