import { UserEntity } from '@/api/user/entities/user.entity';
import { Nanoid, Uuid } from '@/common';
import { Bucket, Entity as EntityEnum, UploadStatus } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { AutoNanoId } from '@/decorators';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity(EntityEnum.MEDIA)
export class MediaEntity extends AbstractEntity {
  constructor(data?: Partial<MediaEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_media_id' })
  media_id: Uuid;

  @Index('EK_media_id', { unique: true })
  @Column({ type: 'varchar', length: 13 })
  @AutoNanoId(13)
  id: Nanoid;

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

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;
}
