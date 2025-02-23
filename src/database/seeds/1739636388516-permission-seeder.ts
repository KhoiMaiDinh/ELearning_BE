import { PermissionEntity } from '@/api/role/entities/permission.entity';
import { SYSTEM_USER_ID } from '@/constants/app.constant';
import { Permission, PermissionGroup } from '@/constants/permission.constant';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class PermissionSeeder1739636388516 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const permissionRepository = dataSource.getRepository(PermissionEntity);

    const permissions = [
      {
        permission_key: Permission.CREATE_USER,
        description: 'Can create user',
        permission_group: PermissionGroup.USER,
      },
      {
        permission_key: Permission.WRITE_USER,
        description: 'Can write user',
        permission_group: PermissionGroup.USER,
      },
      {
        permission_key: Permission.WRITE_ROLE,
        description: `Can write roles`,
        permission_group: PermissionGroup.ROLE,
      },
      {
        permission_key: Permission.READ_ROLE,
        description: `Can read roles`,
        permission_group: PermissionGroup.ROLE,
      },
    ];

    for (const {
      permission_key,
      permission_group,
      description,
    } of permissions) {
      const existingPermission = await permissionRepository.findOne({
        where: { permission_key },
      });
      if (!existingPermission) {
        await permissionRepository.insert(
          new PermissionEntity({
            permission_group,
            permission_key,
            description,
            createdBy: SYSTEM_USER_ID,
            updatedBy: SYSTEM_USER_ID,
          }),
        );
      }
    }
  }
}
