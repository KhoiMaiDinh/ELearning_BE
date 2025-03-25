import { CategoryEntity } from '@/api/category/entities/category.entity';
import { EnrolledCourseEntity } from '@/api/course/entities/enrolled-course.entity';
import { InstructorEntity } from '@/api/instructor/entities/instructor.entity';
import { SectionEntity } from '@/api/section/entities/section.entity';
import { Uuid } from '@/common';
import { Entity as E, Language } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import { StorageImage, StorageVideo } from '@/libs/minio/';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CourseLevel } from '../enums/course-level.enum';

@Index('UQ_course_title_per_instructor', ['title', 'instructor_id'], {
  unique: true,
})
@Entity(E.COURSE)
export class CourseEntity extends AbstractEntity {
  constructor(data?: Partial<CourseEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid')
  course_id!: Uuid;

  @Index('UQ_course_slug', { unique: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  slug?: string;

  @Index('EK_course_id', {
    unique: true,
  })
  @Column({
    type: 'varchar',
    nullable: false,
    length: 13,
  })
  @AutoNanoId(13)
  id: string;

  @Column({ type: 'varchar', length: 60 })
  title!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  subtitle!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail!: StorageImage;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preview!: StorageVideo;

  @Column({ type: 'boolean', default: false })
  is_approved!: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.VI,
    nullable: true,
  })
  language: Language;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    nullable: true,
  })
  level: CourseLevel | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  published_at: Date;

  @Column({
    type: 'varchar',
    array: true,
    length: 160,
    nullable: true,
  })
  requirements: string[] | null;

  @Column({
    type: 'varchar',
    array: true,
    length: 160,
    nullable: true,
  })
  outcomes: string[] | null;

  @Column({ type: 'boolean', default: false })
  is_disabled: boolean;

  // relations

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.courses)
  @JoinColumn({ name: 'instructor_id' })
  instructor?: Relation<InstructorEntity>;
  @Column({ type: 'uuid' })
  instructor_id?: Uuid;

  @ManyToOne(() => CategoryEntity, (category) => category.courses)
  @JoinColumn({ name: 'category_id' })
  category?: Relation<CategoryEntity>;
  @Column({ type: 'uuid' })
  category_id: Uuid;

  @OneToMany(
    () => EnrolledCourseEntity,
    (enrolled_course) => enrolled_course.course,
  )
  enrolled_users?: Relation<EnrolledCourseEntity[]>;

  @OneToMany(() => SectionEntity, (section) => section.course)
  sections?: Relation<SectionEntity[]>;

  // TODO: price tier
}
