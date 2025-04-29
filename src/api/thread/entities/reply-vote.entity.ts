import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Entity,
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
  user: Relation<UserEntity>;

  @ManyToOne(() => ReplyEntity, (reply) => reply.votes, { onDelete: 'CASCADE' })
  reply: Relation<ReplyEntity>;
}
