import { RoleEntity } from '@/api/role/entities/role.entity';
import { Uuid } from '@/common';
import { ENTITY as E, PERMISSION, PERMISSION_GROUP } from '@/constants';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity(E.PERMISSION)
export class PermissionEntity extends AbstractEntity {
  constructor(data?: Partial<PermissionEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_permission_id',
  })
  permission_id!: Uuid;

  @Column({
    type: 'enum',
    enum: PERMISSION,
    unique: true,
    nullable: false,
  })
  permission_key!: PERMISSION;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description!: string;

  @Column({ type: 'enum', enum: PERMISSION_GROUP, nullable: false })
  permission_group!: PERMISSION_GROUP;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: Relation<RoleEntity[]>;
}
