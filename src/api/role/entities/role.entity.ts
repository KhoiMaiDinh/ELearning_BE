import { UserEntity } from '@/api/user/entities/user.entity';
import { Uuid } from '@/common/index';
import { AbstractEntity } from '@/database/entities/abstract.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';

@Entity('role')
export class RoleEntity extends AbstractEntity {
  constructor(data?: Partial<RoleEntity>) {
    super();
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_role_id' })
  role_id!: Uuid;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  role_name!: string;

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable()
  permissions: Relation<PermissionEntity[]>;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: Relation<UserEntity[]>;
}
