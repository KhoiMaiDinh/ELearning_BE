import { RoleEntity } from '@/api/role/entities/role.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { DefaultRole, RegisterMethod } from '@/constants';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class UserSeeder1722335726360 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(UserEntity);
    const role = dataSource.getRepository(RoleEntity);

    const admin_user = await repository.findOneBy({ username: 'Admin' });
    const admin_role = await role.findOneBy({ role_name: DefaultRole.ADMIN });
    if (!admin_user) {
      await repository.insert(
        new UserEntity({
          username: 'Admin',
          email: 'admin@example.com',
          password: 'Admin@12345',
          register_method: RegisterMethod.LOCAL,
          first_name: 'Admin',
          last_name: 'User',
          roles: [admin_role],
        }),
      );
    }

    // const userFactory = factoryManager.get(UserEntity);
    // await userFactory.saveMany(5);
  }
}
