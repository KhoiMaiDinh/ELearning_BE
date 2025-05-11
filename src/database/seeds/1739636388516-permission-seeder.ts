import { PermissionEntity } from '@/api/role/entities/permission.entity';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { Permission, PermissionGroup } from '@/constants/permission.constant';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class PermissionSeeder1739636388516 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const permissionRepository = dataSource.getRepository(PermissionEntity);

    const permissionGroupMap: Record<Permission, PermissionGroup> = {
      [Permission.CREATE_USER]: PermissionGroup.USER,
      [Permission.WRITE_USER]: PermissionGroup.USER,
      [Permission.WRITE_ROLE]: PermissionGroup.ROLE,
      [Permission.READ_ROLE]: PermissionGroup.ROLE,
      [Permission.WRITE_CATEGORY]: PermissionGroup.CATEGORY,
      [Permission.DELETE_CATEGORY]: PermissionGroup.CATEGORY,
      [Permission.WRITE_COURSE]: PermissionGroup.COURSE,
      [Permission.READ_COURSE]: PermissionGroup.COURSE,
      [Permission.READ_COURSE_ITEM]: PermissionGroup.COURSE,
      [Permission.WRITE_COURSE_ITEM]: PermissionGroup.COURSE,
      [Permission.WRITE_SECTION]: PermissionGroup.COURSE,
      [Permission.READ_ORDER]: PermissionGroup.USER,
      [Permission.HOME]: PermissionGroup.USER,
      [Permission.WRITE_ACCOUNT]: PermissionGroup.ACCOUNT,
      [Permission.READ_ACCOUNT]: PermissionGroup.ACCOUNT,
      [Permission.READ_PAYOUT]: PermissionGroup.PAYOUT,
      [Permission.WRITE_PAYOUT]: PermissionGroup.PAYOUT,
      [Permission.WRITE_COUPON]: PermissionGroup.COUPON,
      [Permission.READ_REPORT]: PermissionGroup.BAN,
      [Permission.WRITE_BAN]: PermissionGroup.BAN,
      [Permission.READ_BAN]: PermissionGroup.BAN,
    };

    const permissions = Object.values(Permission).map((permission_key) => ({
      permission_key,
      permission_group: permissionGroupMap[permission_key],
      description: permission_key.replace(':', ' ').replace('_', ' '),
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    }));

    const entities = permissionRepository.create(permissions);
    await permissionRepository.upsert(entities, ['permission_key']);
  }
}
