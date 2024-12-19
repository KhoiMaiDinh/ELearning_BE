// Libs
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

// Common
import { ExternalId, RegisterMethod, Uuid } from '@app/common';

// App
import { TeacherProfile } from './teacher-profile.entity';
import { UserPreference } from '../../preference';
import { RefreshToken } from '../../auth';

@Entity('User')
@Unique(['email', 'register_method'])
export class User {
  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
  @PrimaryGeneratedColumn('uuid')
  _id: Uuid;

  @Column({ type: 'varchar', length: 8, unique: true })
  user_id: ExternalId;

  @Column({ type: 'varchar', length: 60 })
  first_name: string;

  @Column({ type: 'varchar', length: 60 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_img: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  google_id: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  facebook_id: string | null;

  @Column({ type: 'enum', enum: RegisterMethod })
  register_method: RegisterMethod;

  @Column({ type: 'boolean' })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => TeacherProfile, (teacher_profile) => teacher_profile.user)
  teacher_profile: TeacherProfile;

  @OneToMany(() => RefreshToken, (refresh_token) => refresh_token.user)
  refresh_tokens: RefreshToken[];

  @OneToMany(() => UserPreference, (user_preference) => user_preference.user)
  user_preferences: UserPreference[];
}
