import { PermissionEntity } from '@/api/role/entities/permission.entity';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { PERMISSION, PERMISSION_GROUP } from '@/constants/permission.constant';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class PermissionSeeder1739636388516 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const permissionRepository = dataSource.getRepository(PermissionEntity);

    const permissionGroupMap: Record<PERMISSION, PERMISSION_GROUP> = {
      [PERMISSION.CREATE_USER]: PERMISSION_GROUP.USER,
      [PERMISSION.WRITE_USER]: PERMISSION_GROUP.USER,
      [PERMISSION.WRITE_ROLE]: PERMISSION_GROUP.ROLE,
      [PERMISSION.READ_ROLE]: PERMISSION_GROUP.ROLE,
      [PERMISSION.WRITE_CATEGORY]: PERMISSION_GROUP.CATEGORY,
      [PERMISSION.DELETE_CATEGORY]: PERMISSION_GROUP.CATEGORY,
      [PERMISSION.WRITE_COURSE]: PERMISSION_GROUP.COURSE,
      [PERMISSION.READ_COURSE]: PERMISSION_GROUP.COURSE,
      [PERMISSION.READ_COURSE_ITEM]: PERMISSION_GROUP.COURSE,
      [PERMISSION.WRITE_COURSE_ITEM]: PERMISSION_GROUP.COURSE,
      [PERMISSION.WRITE_SECTION]: PERMISSION_GROUP.COURSE,
      [PERMISSION.READ_ORDER]: PERMISSION_GROUP.USER,
      [PERMISSION.HOME]: PERMISSION_GROUP.USER,
      [PERMISSION.WRITE_ACCOUNT]: PERMISSION_GROUP.ACCOUNT,
      [PERMISSION.READ_ACCOUNT]: PERMISSION_GROUP.ACCOUNT,
      [PERMISSION.READ_PAYOUT]: PERMISSION_GROUP.PAYOUT,
      [PERMISSION.WRITE_PAYOUT]: PERMISSION_GROUP.PAYOUT,
      [PERMISSION.WRITE_COUPON]: PERMISSION_GROUP.COUPON,
      [PERMISSION.READ_REPORT]: PERMISSION_GROUP.BAN,
      [PERMISSION.WRITE_BAN]: PERMISSION_GROUP.BAN,
      [PERMISSION.READ_BAN]: PERMISSION_GROUP.BAN,
      [PERMISSION.READ_REPLY]: PERMISSION_GROUP.THREAD,
    };

    const permissions = Object.values(PERMISSION).map((permission_key) => ({
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
