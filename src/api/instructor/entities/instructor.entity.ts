import { CategoryEntity } from '@/api/category/entities/category.entity';
import { CourseEntity } from '@/api/course/entities/course.entity';
import { CertificateEntity } from '@/api/instructor/entities/certificate.entity';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common';
import { Entity as E } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity(E.INSTRUCTOR)
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
  @Column({ type: 'text' })
  biography!: string;

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
  @Column({ type: 'uuid', nullable: true })
  resume_id?: Uuid;
  @OneToOne(() => MediaEntity, { eager: true })
  @JoinColumn({ referencedColumnName: 'media_id', name: 'resume_id' })
  resume?: Relation<MediaEntity>;

  @OneToMany(() => CertificateEntity, (certificate) => certificate.instructor)
  certificates: Relation<CertificateEntity[]>;

  // relations
  @ManyToOne(() => CategoryEntity, (category) => category.instructors)
  @JoinColumn({ name: 'category_id' })
  category: Relation<CategoryEntity>;
  @Column({ type: 'uuid' })
  category_id: Uuid;

  @OneToMany(() => CourseEntity, (course) => course.instructor)
  courses: Relation<CourseEntity[]>;
}
