import { Uuid } from '@/common/index';
import { Permission, PermissionGroup } from '@/constants/permission.constant';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('permission')
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
  roles: RoleEntity[];
}
