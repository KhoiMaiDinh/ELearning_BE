// threads/thread.entity.ts
import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
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
import { ReplyEntity } from './reply.entity';

@Entity('thread')
export class ThreadEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  thread_id: Uuid;

  @Column({ type: 'varchar' })
  @AutoNanoId(13)
  @Index('EK_thread_id', { unique: true })
  id: Nanoid;

  @Column('varchar', { length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'author_id', referencedColumnName: 'user_id' })
  author: Relation<UserEntity>;
  @Column('uuid')
  author_id: Uuid;

  @ManyToOne(() => LectureEntity)
  @JoinColumn({ name: 'lecture_id' })
  lecture: Relation<LectureEntity>;
  @Column('uuid')
  lecture_id: Uuid;

  @OneToMany(() => ReplyEntity, (reply) => reply.thread, { cascade: true })
  replies: ReplyEntity[];
}
