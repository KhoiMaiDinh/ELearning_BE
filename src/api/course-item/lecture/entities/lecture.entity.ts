import { UserLessonProgressEntity } from '@/api/course-progress/entities/lesson-progress.entity';
import { CourseStatus } from '@/api/course/enums';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { SectionEntity } from '@/api/section/entities/section.entity';
import { Nanoid, Uuid } from '@/common';
import { ENTITY } from '@/constants';
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
import { LectureSeriesEntity } from './lecture-series.entity';
import { ResourceEntity } from './resource.entity';

@Entity(ENTITY.LECTURE)
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

  @Column({ type: 'varchar' })
  position: string;

  @Column({ type: 'boolean', default: false })
  is_hidden: boolean;

  // relations
  @Column({ type: 'uuid' })
  section_id: Uuid;
  @ManyToOne(() => SectionEntity, (section) => section.lectures)
  @JoinColumn({ name: 'section_id' })
  section: Relation<SectionEntity>;

  @OneToMany(() => UserLessonProgressEntity, (progress) => progress.lecture)
  progresses?: Relation<UserLessonProgressEntity[]>;

  @OneToMany(() => LectureSeriesEntity, (series) => series.lecture)
  series?: Relation<LectureSeriesEntity[]>;

  get latestPublishedSeries(): LectureSeriesEntity | null {
    return (
      this.series
        ?.filter((s) => s.status === CourseStatus.PUBLISHED)
        .sort((a, b) => b.version - a.version)[0] ?? null
    );
  }

  get title(): string | null {
    return this.latestPublishedSeries?.title ?? null;
  }

  get is_preview(): boolean | null {
    return this.latestPublishedSeries?.is_preview ?? null;
  }

  get description(): string | null {
    return this.latestPublishedSeries?.description ?? null;
  }

  get video(): MediaEntity | null {
    return this.latestPublishedSeries?.video ?? null;
  }

  get duration_in_seconds(): number | null {
    return this.latestPublishedSeries?.duration_in_seconds ?? null;
  }

  get resources(): ResourceEntity[] | null {
    return this.latestPublishedSeries?.resources ?? null;
  }

  get version(): number | null {
    return this.latestPublishedSeries?.version ?? null;
  }
}
