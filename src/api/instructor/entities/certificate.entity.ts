import { MediaEntity } from '@/api/media/entities/media.entity';
import { Uuid } from '@/common';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { InstructorEntity } from './instructor.entity';

@Entity('instructor-certificate')
export class CertificateEntity extends AbstractEntity {
  constructor(data?: Partial<CertificateEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  certificate_id: Uuid;

  @Column({ type: 'uuid', nullable: true })
  certificate_file_id?: Uuid;
  @OneToOne(() => MediaEntity, { eager: true })
  @JoinColumn({
    referencedColumnName: 'media_id',
    name: 'certificate_image_id',
  })
  certificate_file?: Relation<MediaEntity>;

  @Column({ type: 'uuid', nullable: true })
  instructor_id?: Uuid;
  @ManyToOne(() => InstructorEntity, (instructor) => instructor.certificates)
  @JoinColumn({
    referencedColumnName: 'instructor_id',
    name: 'instructor_id',
  })
  instructor?: Relation<InstructorEntity>;
}
