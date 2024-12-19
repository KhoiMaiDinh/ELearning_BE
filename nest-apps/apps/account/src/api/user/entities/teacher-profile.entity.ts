import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ExternalId, Uuid } from '@app/common';

@Entity('TeacherProfile')
export class TeacherProfile {
  constructor(data?: Partial<TeacherProfile>) {
    Object.assign(this, data);
  }

  @PrimaryColumn('uuid')
  iuser_id: Uuid;
  @OneToOne(() => User)
  @JoinColumn({ name: 'iuser_id' })
  user: User;

  @Column({ type: 'varchar', length: 8, unique: true })
  teacher_id: ExternalId;

  @Column({ type: 'text', length: 1000 })
  biography: ExternalId;

  @Column({ type: 'varchar', length: 100 })
  headline: string;

  @Column({ type: 'varchar', nullable: false })
  resume_url: string;

  @Column({ type: 'timestamp', nullable: true })
  approval_at: Date;

  @Column({ type: 'varchar', nullable: true })
  approved_by: string;

  @Column({ type: 'varchar', nullable: true })
  website_url: string;

  @Column({ type: 'varchar', nullable: true })
  facebook_url: string;

  @Column({ type: 'varchar', nullable: true })
  linkedin_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
