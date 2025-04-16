import { PermissionRes } from '@/api/role/dto/permission.res.dto';
import { WrapperType } from '@/common';
import { ClassField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RoleRes {
  @Expose()
  @StringField()
  role_name: string;

  @Expose()
  @ClassField(() => PermissionRes)
  permissions?: WrapperType<PermissionRes[]>;
}
