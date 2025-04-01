import { MediaEntity } from '@/api/media/entities/media.entity';
import { SectionEntity } from '@/api/section/entities/section.entity';
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
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('lecture')
export class LectureEntity extends AbstractEntity {
  constructor(partial?: Partial<LectureEntity>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_lecture_id',
  })
  lecture_id: Uuid;

  // common props
  @Index('EQ_lecture_id', { unique: true })
  @Column({ type: 'varchar', length: 13 })
  @AutoNanoId(13)
  id: Nanoid;

  @Column({ type: 'varchar', length: 60 })
  title: string;

  @Column({ type: 'varchar' })
  position: string;

  @Column({ type: 'boolean', default: false })
  is_preview: boolean;

  // relations
  @Column({ type: 'uuid' })
  section_id: Uuid;
  @ManyToOne(() => SectionEntity, (section) => section.lectures)
  @JoinColumn({ name: 'section_id' })
  section: Relation<SectionEntity>;

  // unique props
  @OneToMany(() => LectureVideoEntity, (video) => video.lecture, {
    cascade: true,
  })
  videos?: Relation<LectureVideoEntity[]>;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  resource_id: Uuid;
  @OneToMany(() => ResourceEntity, (resource) => resource.lecture, {
    cascade: true,
  })
  resources?: Relation<ResourceEntity[]>;

  get video() {
    return this.videos?.sort((a, b) => b.version - a.version)[0] ?? null;
  }
}

@Entity('lecture-video')
@Index(['lecture_id', 'version'], { unique: true })
export class LectureVideoEntity extends AbstractEntity {
  constructor(partial?: Partial<LectureVideoEntity>) {
    super();
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_lecture_video_id',
  })
  lecture_video_id: Uuid;

  @Column({ type: 'uuid' })
  video_id?: Uuid;
  @OneToOne(() => MediaEntity, { eager: true })
  @JoinColumn({
    referencedColumnName: 'media_id',
    name: 'video_id',
  })
  video?: Relation<MediaEntity>;

  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'uuid' })
  lecture_id: Uuid;
  @ManyToOne(() => LectureEntity, (lecture) => lecture.videos)
  @JoinColumn({ name: 'lecture_id' })
  lecture: Relation<LectureEntity>;
}

@Entity('resource')
export class ResourceEntity extends AbstractEntity {
  constructor(partial?: Partial<ResourceEntity>) {
    super();
    Object.assign(this, partial);
  }
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_resource_id',
  })
  resource_id: Uuid;

  @Column({ type: 'uuid' })
  resource_file_id?: Uuid;
  @OneToOne(() => MediaEntity, { eager: true })
  @JoinColumn({
    referencedColumnName: 'media_id',
    name: 'resource_file_id',
  })
  resource_file?: Relation<MediaEntity>;

  @ManyToOne(() => LectureEntity, (lecture) => lecture.resources)
  @JoinColumn({ name: 'lecture_id' })
  lecture: Relation<LectureEntity>;
}
