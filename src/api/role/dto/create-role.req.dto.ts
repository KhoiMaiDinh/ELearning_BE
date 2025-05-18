import { PERMISSION } from '@/constants/permission.constant';
import { StringField } from '@/decorators/field.decorators';

export class CreateRoleReq {
  @StringField()
  role_name: string;

  @StringField({
    each: true,
    required: false,
    enum: PERMISSION,
  })
  permission_keys?: PERMISSION[];
}
