import { CategoryEntity } from '@/api/category/entities/category.entity';
import { CourseLevel, CourseStatus } from '@/api/course';
import { EnrolledCourseEntity } from '@/api/course/entities/enrolled-course.entity';
import { InstructorEntity } from '@/api/instructor/entities/instructor.entity';
import { MediaEntity } from '@/api/media/entities/media.entity';
import { SectionEntity } from '@/api/section/entities/section.entity';
import { Nanoid, Uuid } from '@/common';
import { Entity as E, Language } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  VirtualColumn,
} from 'typeorm';

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
  id: Nanoid;

  @Column({ type: 'varchar', length: 60 })
  title!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  subtitle!: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail_id: Uuid;

  @OneToOne(() => MediaEntity)
  @JoinColumn({ name: 'thumbnail_id', referencedColumnName: 'media_id' })
  thumbnail!: MediaEntity;

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

  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.DRAFT })
  status: CourseStatus;
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

  @OneToMany(() => SectionEntity, (section) => section.course)
  sections?: Relation<SectionEntity[]>;

  @OneToMany(
    () => EnrolledCourseEntity,
    (enrolled_course) => enrolled_course.course,
  )
  enrolled_users?: Relation<EnrolledCourseEntity[]>;

  @Column({ type: 'uuid', nullable: true })
  price_tier_id?: Uuid;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency: string;

  @VirtualColumn({
    query: (alias) =>
      `(SELECT AVG(enrolled.rating)
              FROM "enrolled-course" enrolled
              WHERE enrolled.course_id = ${alias}.course_id
                AND enrolled.rating IS NOT NULL)`,
  })
  avg_rating: number;

  @VirtualColumn({
    query: (alias) =>
      `(SELECT COUNT(*)
              FROM "enrolled-course" enrolled
              WHERE enrolled.course_id = ${alias}.course_id)`,
  })
  total_enrolled: number;

  @VirtualColumn({
    query: (alias) => ``,
  })
  course_progress: number;
}
