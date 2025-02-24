import { WrapperType } from '@/common';
import { Permission, PermissionGroup } from '@/constants';
import { ClassField, EnumField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { RoleRes } from './role.res.dto';

@Exclude()
export class PermissionRes {
  @Expose()
  @EnumField(() => Permission)
  permission_key: Permission;

  @Expose()
  @StringField()
  description: string;

  @Expose()
  @EnumField(() => PermissionGroup)
  permission_group: PermissionGroup;

  @Expose()
  @ClassField(() => RoleRes)
  roles?: WrapperType<RoleRes[]>;
}
