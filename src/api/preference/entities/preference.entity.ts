import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { Entity as E, Language, Theme } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
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
}
