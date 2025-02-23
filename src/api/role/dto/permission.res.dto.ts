import { WrapperType } from '@/common/index';
import { Permission, PermissionGroup } from '@/constants/permission.constant';
import {
  ClassField,
  EnumField,
  StringField,
} from '@/decorators/field.decorators';
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
