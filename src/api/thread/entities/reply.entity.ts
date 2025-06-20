// replies/reply.entity.ts
import { UserEntity } from '@/api/user/entities/user.entity';
import { Nanoid, Uuid } from '@/common';
import { ENTITY as E } from '@/constants';
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
import { ReplyVoteEntity } from './reply-vote.entity';
import { ThreadEntity } from './thread.entity';

@Entity(E.REPLY)
export class ReplyEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  reply_id: Uuid;

  @Column({ type: 'varchar' })
  @AutoNanoId(13)
  @Index('EK_reply_id', { unique: true })
  id: Nanoid;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'author_id', referencedColumnName: 'user_id' })
  author: Relation<UserEntity>;
  @Column('uuid')
  author_id: Uuid;

  @ManyToOne(() => ThreadEntity, (thread) => thread.replies)
  @JoinColumn({ name: 'thread_id' })
  thread: Relation<ThreadEntity>;
  @Column('uuid')
  thread_id: Uuid;

  @OneToMany(() => ReplyVoteEntity, (vote) => vote.reply)
  votes: Relation<ReplyVoteEntity[]>;
}
