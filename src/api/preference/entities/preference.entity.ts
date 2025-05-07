import { CategoryEntity } from '@/api/category/entities/category.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { Entity as E, Language, Theme } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity(E.PREFERENCE)
export class PreferenceEntity extends AbstractEntity {
  constructor(data?: Partial<PreferenceEntity>) {
    super();
    Object.assign(this, data);
  }
  @PrimaryGeneratedColumn('uuid')
  preference_id: Uuid;

  @Column({ type: 'enum', enum: Theme, default: Theme.LIGHT })
  theme: Theme;

  @Column({ type: 'enum', enum: Language, default: Language.VI })
  language: Language;

  @OneToOne(() => UserEntity, (user) => user.preference)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;

  @Column('uuid')
  user_id: Uuid;

  @ManyToMany(() => CategoryEntity, { cascade: true })
  @JoinTable({
    name: 'preference_categories',
    joinColumn: {
      name: 'preference_id',
      referencedColumnName: 'preference_id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'category_id',
    },
  })
  categories: Relation<CategoryEntity>[];
}
