import { PermissionEntity } from '@/api/role/entities/permission.entity';
import { RoleEntity } from '@/api/role/entities/role.entity';
import { Permission } from '@/constants/permission.constant';
import { DefaultRole } from '@/constants/role.constant';
import { DataSource, In } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class RoleSeeder1739599861794 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const roleRepo = dataSource.getRepository(RoleEntity);
    const permissionRepo = dataSource.getRepository(PermissionEntity);

    const defaultRoles = [
      DefaultRole.ADMIN,
      DefaultRole.STUDENT,
      DefaultRole.TEACHER,
    ];

    for (const role of defaultRoles) {
      const existingRole = await roleRepo.findOne({
        where: { role_name: role },
      });
      let permissions: PermissionEntity[] = [];
      if (role === DefaultRole.ADMIN) {
        permissions = await permissionRepo.find({
          where: {
            permission_key: In([Permission.WRITE_ROLE, Permission.READ_ROLE]),
          },
        });
      }
      if (!existingRole) {
        await roleRepo.insert(
          new RoleEntity({
            role_name: role,
            permissions: permissions,
          }),
        );
      } else {
        existingRole.permissions = permissions;
        await roleRepo.save(existingRole);
      }
    }
  }
}
