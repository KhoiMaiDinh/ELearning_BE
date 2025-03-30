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
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('article')
export class ArticleEntity extends AbstractEntity {
  constructor(partial?: Partial<ArticleEntity>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_article_id',
  })
  article_id: Uuid;

  // common props
  @Index('EQ_article_id', { unique: true })
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
  @ManyToOne(() => SectionEntity, (section) => section.articles)
  @JoinColumn({ name: 'section_id' })
  section: Relation<SectionEntity>;

  // unique props

  @Column({ type: 'text', nullable: true })
  content: string;
}
