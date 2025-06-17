import { MediaEntity } from '@/api/media/entities/media.entity';
import { Uuid } from '@/common';
import { ENTITY } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { LectureSeriesEntity } from './lecture-series.entity';

@Entity(ENTITY.LECTURE_RESOURCE)
export class ResourceEntity extends AbstractEntity {
  constructor(partial?: Partial<ResourceEntity>) {
    super();
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_resource_id',
  })
  resource_id: Uuid;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'uuid' })
  resource_file_id?: Uuid;
  @ManyToOne(() => MediaEntity, { eager: true })
  @JoinColumn({
    referencedColumnName: 'media_id',
    name: 'resource_file_id',
  })
  resource_file?: Relation<MediaEntity>;

  @ManyToMany(
    () => LectureSeriesEntity,
    (lecture_series) => lecture_series.resources,
  )
  lecture: Relation<LectureSeriesEntity[]>;
}
