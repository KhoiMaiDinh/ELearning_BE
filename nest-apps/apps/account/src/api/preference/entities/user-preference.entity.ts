// Libs
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
// Common
import { Language, Theme, Uuid } from '@app/common';
// App
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryColumn('uuid')
  iuser_id: Uuid;
  @OneToOne(() => User)
  @JoinColumn({ name: 'iuser_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: Theme,
    default: Theme.LIGHT,
  })
  theme: Theme;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.EN,
  })
  language: Language;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
