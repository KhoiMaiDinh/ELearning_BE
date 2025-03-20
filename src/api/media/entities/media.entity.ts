import { Bucket, Entity as EntityEnum, UploadStatus } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity(EntityEnum.MEDIA)
export class MediaEntity extends AbstractEntity {
  constructor(data?: Partial<MediaEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  media_id: number;

  @Column({ type: 'enum', enum: Bucket })
  bucket: Bucket;

  @Column({ type: 'varchar', length: 255, unique: true })
  key: string;

  @Column({ type: 'enum', enum: UploadStatus })
  status: UploadStatus;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  @Column({ type: 'enum', enum: EntityEnum })
  entity: EntityEnum;

  @Column({ type: 'varchar', length: 255 })
  entity_property: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;
}
