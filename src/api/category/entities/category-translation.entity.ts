import { Uuid } from '@/common';
import { Language } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CategoryEntity } from './category.entity';

@Entity('category-translation')
export class CategoryTranslationEntity extends AbstractEntity {
  constructor(data?: Partial<CategoryTranslationEntity>) {
    super();
    Object.assign(this, data);
  }
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_category_translation_id',
  })
  category_translation_id: Uuid;

  @Index('UQ_category_name', { unique: true })
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'enum', enum: Language }) // e.g., "en", "vi"
  language: Language;

  @ManyToOne(() => CategoryEntity, (category) => category.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Relation<CategoryEntity>;

  @Column({ type: 'uuid' })
  category_id: Uuid;
}
