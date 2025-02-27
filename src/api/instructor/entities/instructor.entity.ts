import { UserEntity } from '@/api/user';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity('instructor')
export class InstructorEntity extends AbstractEntity {
  constructor(data?: Partial<InstructorEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_teacher_id' })
  instructor_id!: Uuid;

  @Column({ type: 'uuid', unique: true })
  user_id!: Uuid;
  @OneToOne(() => UserEntity, (user) => user.instructor_profile)
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserEntity>;

  // bios
  @Column({ type: 'jsonb' })
  biography!: object;

  @Column({ type: 'varchar', length: 60 })
  headline!: string;

  // approval
  @Column({ type: 'boolean', default: false })
  is_approved!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  disapproval_reason!: object;

  // urls
  @Column({ type: 'varchar', length: 255, nullable: true })
  website_url?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  facebook_url?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  linkedin_url?: string;

  // resume and certificates
  @Column({ type: 'varchar', length: 255 })
  resume_url?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  first_certificate_url?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  second_certificate_url?: string;
  @Column({ type: 'varchar', length: 255, nullable: true })
  third_certificate_url?: string;
}
