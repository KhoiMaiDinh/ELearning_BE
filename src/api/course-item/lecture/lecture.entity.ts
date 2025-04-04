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
  @Column({ type: 'uuid' })
  video_id: Uuid;
  @OneToOne(() => MediaEntity)
  @JoinColumn({ name: 'video_id', referencedColumnName: 'media_id' })
  video?: Relation<MediaEntity>;

  @Column({ type: 'int' })
  video_duration: number; // milliseconds

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  resource_id: Uuid;
  @OneToOne(() => MediaEntity)
  @JoinColumn({ name: 'resource_id', referencedColumnName: 'media_id' })
  resource?: Relation<MediaEntity>;
}
