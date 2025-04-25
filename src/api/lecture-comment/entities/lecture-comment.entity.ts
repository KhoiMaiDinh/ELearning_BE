import { LectureEntity } from '@/api/course-item/lecture/lecture.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { Entity as E } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
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

  @OneToMany(() => CommentAspectEntity, (aspect) => aspect.comment)
  aspects: Relation<CommentAspectEntity[]>;
}
