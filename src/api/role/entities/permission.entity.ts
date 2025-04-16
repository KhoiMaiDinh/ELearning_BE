import { RoleEntity } from '@/api/role/entities/role.entity';
import { Uuid } from '@/common';
import { Entity as E, Permission, PermissionGroup } from '@/constants';
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
    enum: Permission,
    unique: true,
    nullable: false,
  })
  permission_key!: Permission;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description!: string;

  @Column({ type: 'enum', enum: PermissionGroup, nullable: false })
  permission_group!: PermissionGroup;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: Relation<RoleEntity[]>;
}
