import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity('course-unban-request')
export class CourseUnbanRequestEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  request_id: Uuid;

  @ManyToOne(() => CourseEntity, { onDelete: 'CASCADE' })
  course: Relation<CourseEntity>;

  @Column('text')
  reason: string;

  @Column({ default: false })
  is_reviewed: boolean;

  @Column({ default: false })
  is_approved: boolean;

  @Column('varchar', { nullable: true })
  disapproval_reason?: string;
}
