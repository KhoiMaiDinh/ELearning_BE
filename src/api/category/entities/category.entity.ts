import { InstructorEntity } from '@/api/instructor/entities/instructor.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { CategoryTranslationEntity } from './category-translation.entity';

@Entity('category')
@Tree('materialized-path')
export class CategoryEntity extends AbstractEntity {
  constructor(data?: Partial<CategoryEntity>) {
    super();
    Object.assign(this, data);
  }
  @PrimaryGeneratedColumn('uuid')
  category_id: Uuid;

  @Index('UQ_category_slug', { unique: true })
  @Column({ type: 'varchar', length: 50 })
  slug: string;

  @OneToMany(
    () => CategoryTranslationEntity,
    (translation) => translation.category,
    { cascade: true },
  )
  translations: Relation<CategoryTranslationEntity[]>;

  @TreeParent({ onDelete: 'CASCADE' })
  parent?: CategoryEntity;

  @TreeChildren()
  children?: CategoryEntity[];

  @OneToMany(() => InstructorEntity, (instructor) => instructor.category)
  instructors?: Relation<InstructorEntity[]>;
}
