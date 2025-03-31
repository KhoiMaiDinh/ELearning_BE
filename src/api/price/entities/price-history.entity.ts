import { CourseEntity } from '@/api/course/entities/course.entity';
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

@Entity('course_price_history')
export class CoursePriceHistoryEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  course_price_history_id: Uuid;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  course: Relation<CourseEntity>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  old_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  new_price: number;
}
