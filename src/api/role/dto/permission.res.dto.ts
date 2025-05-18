import { RoleRes } from '@/api/role/dto/role.res.dto';
import { WrapperType } from '@/common';
import { PERMISSION, PERMISSION_GROUP } from '@/constants';
import { ClassField, EnumField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PermissionRes {
  @Expose()
  @EnumField(() => PERMISSION)
  permission_key: PERMISSION;

  @Expose()
  @StringField()
  description: string;

  @Expose()
  @EnumField(() => PERMISSION_GROUP)
  permission_group: PERMISSION_GROUP;

  @Expose()
  @ClassField(() => RoleRes)
  roles?: WrapperType<RoleRes[]>;
}
