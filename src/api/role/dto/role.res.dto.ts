import { WrapperType } from '@/common';
import { ClassField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { PermissionRes } from './permission.res.dto';

@Exclude()
export class RoleRes {
  @Expose()
  @StringField()
  role_name: string;

  @Expose()
  @ClassField(() => PermissionRes)
  permissions?: WrapperType<PermissionRes[]>;
}
