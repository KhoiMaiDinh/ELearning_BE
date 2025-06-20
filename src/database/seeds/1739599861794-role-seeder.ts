import { PermissionEntity } from '@/api/role/entities/permission.entity';
import { RoleEntity } from '@/api/role/entities/role.entity';
import { PERMISSION } from '@/constants/permission.constant';
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
      DefaultRole.INSTRUCTOR,
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
              PERMISSION.WRITE_ROLE,
              PERMISSION.READ_ROLE,
              PERMISSION.WRITE_USER,
              PERMISSION.CREATE_USER,
              PERMISSION.WRITE_COURSE,
              PERMISSION.WRITE_COURSE_ITEM,
              PERMISSION.WRITE_SECTION,
              PERMISSION.WRITE_CATEGORY,
              PERMISSION.READ_COURSE_ITEM,
              PERMISSION.READ_ORDER,
              PERMISSION.READ_REPORT,
              PERMISSION.READ_COURSE,
              PERMISSION.READ_ACCOUNT,
              PERMISSION.READ_BAN,
              PERMISSION.WRITE_BAN,
              PERMISSION.WRITE_COUPON,
              PERMISSION.READ_REPLY,
              PERMISSION.READ_PAYOUT,
              PERMISSION.WRITE_PAYOUT,
            ]),
          },
        });
      } else if (role === DefaultRole.STUDENT) {
        permissions = await permissionRepo.find({
          where: {
            permission_key: In([PERMISSION.HOME]),
          },
        });
      } else if (role === DefaultRole.INSTRUCTOR) {
        permissions = await permissionRepo.find({
          where: {
            permission_key: In([PERMISSION.HOME]),
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
