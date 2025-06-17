import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { ENTITY as E } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity(E.FAVORITE_COURSE)
export class FavoriteCourseEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  favorite_course_id: Uuid;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column('uuid')
  user_id: Uuid;

  @ManyToOne(() => CourseEntity)
  @JoinColumn({ name: 'course_id' })
  course: Relation<CourseEntity>;

  @Column('uuid')
  course_id: Uuid;
}
