import { LectureEntity } from '@/api/course-item/lecture/entities/lecture.entity';
import { ResourceEntity } from '@/api/course-item/lecture/entities/resource.entity';
import { CourseStatus } from '@/api/course/enums';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { Uuid } from '@/common';
import { ENTITY } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity(ENTITY.LECTURE_SERIES)
@Index(['lecture_id', 'version'], { unique: true })
export class LectureSeriesEntity extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_lecture_series_id',
  })
  lecture_series_id: Uuid;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'uuid' })
  lecture_id: Uuid;

  @ManyToOne(() => LectureEntity, (lecture) => lecture.series)
  @JoinColumn({ name: 'lecture_id' })
  lecture: Relation<LectureEntity>;

  @Column({ type: 'varchar', length: 60 })
  title: string;

  @Column({ type: 'boolean', default: false })
  is_preview: boolean;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  video_id?: Uuid;
  @ManyToOne(() => MediaEntity, { eager: true })
  @JoinColumn({
    referencedColumnName: 'media_id',
    name: 'video_id',
  })
  video?: Relation<MediaEntity>;

  @Column({ type: 'float', default: 0 })
  duration_in_seconds: number;

  @ManyToMany(() => ResourceEntity, (resource) => resource.lecture, {
    cascade: true,
    eager: true,
  })
  @JoinTable({
    inverseJoinColumn: {
      name: 'resource_id',
      referencedColumnName: 'resource_id',
    },
    joinColumn: {
      name: 'lecture_series_id',
      referencedColumnName: 'lecture_series_id',
    },
  })
  resources?: Relation<ResourceEntity[]>;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;
}
