import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Aspect, Emotion } from '../enum';
import { LectureCommentEntity } from './lecture-comment.entity';

@Entity('comment-aspect')
export class CommentAspectEntity extends AbstractEntity {
  constructor(data?: Partial<CommentAspectEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid')
  comment_aspect_id: Uuid;

  @ManyToOne(() => LectureCommentEntity, (comment) => comment.aspects, {
    cascade: true,
  })
  comment: Relation<LectureCommentEntity>;

  @Column({ type: 'enum', enum: Aspect })
  aspect: Aspect;

  @Column({ type: 'enum', enum: Emotion })
  emotion: Emotion;
}
