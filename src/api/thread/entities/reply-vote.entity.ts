import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';
import { ReplyEntity } from './reply.entity';

@Entity('reply_votes')
@Unique(['user', 'reply'])
export class ReplyVoteEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  reply_vote_id: Uuid;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column('uuid')
  user_id: Uuid;

  @ManyToOne(() => ReplyEntity, (reply) => reply.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reply_id' })
  reply: Relation<ReplyEntity>;

  @Column('uuid')
  reply_id: Uuid;
}
