import { UserEntity } from '@/api/user';
import { Uuid } from '@/common';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('instructor')
export class InstructorEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_teacher_id' })
  teacher_id!: Uuid;

  @Column({ type: 'uuid', unique: true })
  user_id!: Uuid;
  @OneToOne(() => UserEntity, (user) => user.instructor_profile)
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  // bios
  @Column({ type: 'varchar', length: 1000 })
  biography!: string;

  @Column({ type: 'varchar', length: 60 })
  headline!: string;

  @Column({ type: 'boolean', default: false })
  is_approved!: boolean;

  // urls
  @Column({ type: 'varchar', length: 255 })
  resume_url!: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  website_url?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  facebook_url?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedin_url?: string;
}
