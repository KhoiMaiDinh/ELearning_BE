import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Nanoid, Uuid } from '@/common';
import { Entity as E } from '@/constants';
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
import { CommentAspectEntity } from './comment-aspect.entity';

@Entity(E.LECTURE_COMMENT)
export class LectureCommentEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  lecture_comment_id: Uuid;

  @Column('varchar')
  @AutoNanoId(13)
  @Index('EK_lecture_comment_id', { unique: true })
  id: Nanoid;

  @ManyToOne(() => LectureEntity)
  @JoinColumn({ name: 'lecture_id' })
  lecture: LectureEntity;

  @Column('uuid')
  lecture_id: Uuid;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column('uuid')
  user_id: Uuid;

  @Column('varchar')
  content: string;

  @Column({ type: 'boolean', default: false })
  is_solved: boolean;

  @OneToMany(() => CommentAspectEntity, (aspect) => aspect.comment, {
    cascade: true,
  })
  aspects: Relation<CommentAspectEntity[]>;
}
