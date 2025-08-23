import { CourseEntity } from '@/api/course/entities/course.entity';
import { Uuid } from '@/common';
import { ENTITY } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity(ENTITY.COURSE_NOTIFICATION)
export class CourseNotificationEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  course_notification_id: Uuid;

  @AutoNanoId(13)
  @Column({ unique: true })
  id: string;

  @ManyToOne(() => CourseEntity)
  @JoinColumn({ name: 'course_id' })
  course: Relation<CourseEntity>;
  @Column({ type: 'uuid' })
  course_id: Uuid;

  @Column()
  title: string;

  @Column('text')
  content: string;
}
