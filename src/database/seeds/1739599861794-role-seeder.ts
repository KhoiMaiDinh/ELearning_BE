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

    const default_roles = [
      DefaultRole.ADMIN,
      DefaultRole.STUDENT,
      DefaultRole.TEACHER,
    ];

    for (const role of default_roles) {
      const existing_role = await roleRepo.findOne({
        where: { role_name: role },
      });
      let permissions: PermissionEntity[] = [];
      if (role === DefaultRole.ADMIN) {
        permissions = await permissionRepo.find({
          where: {
            permission_key: In([
              Permission.WRITE_ROLE,
              Permission.READ_ROLE,
              Permission.WRITE_USER,
              Permission.CREATE_USER,
              Permission.WRITE_COURSE_ITEM,
              Permission.WRITE_SECTION,
              Permission.WRITE_CATEGORY,
              Permission.READ_COURSE_ITEM,
              Permission.READ_ORDER,
              Permission.READ_REPORT,
            ]),
          },
        });
      } else if (role === DefaultRole.STUDENT) {
        permissions = await permissionRepo.find({
          where: {
            permission_key: In([Permission.HOME]),
          },
        });
      } else if (role === DefaultRole.TEACHER) {
        permissions = await permissionRepo.find({
          where: {
            permission_key: In([Permission.HOME]),
          },
        });
      }
      if (!existing_role) {
        await roleRepo.insert(
          new RoleEntity({
            role_name: role,
            permissions: permissions,
          }),
        );
      } else {
        existing_role.permissions = permissions;
        await roleRepo.save(existing_role);
      }
    }
  }
}
