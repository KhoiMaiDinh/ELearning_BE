import { RoleEntity } from '@/api/role/entities/role.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { DefaultRole, RegisterMethod } from '@/constants/index';
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

    const adminUser = await repository.findOneBy({ username: 'Admin' });
    const adminRole = await role.findOneBy({ role_name: DefaultRole.ADMIN });
    if (!adminUser) {
      await repository.insert(
        new UserEntity({
          username: 'Admin',
          email: 'admin@example.com',
          password: 'Admin@12345',
          profile_image: 'https://example.com/avatar.png',
          register_method: RegisterMethod.LOCAL,
          first_name: 'Admin',
          last_name: 'User',
          roles: [adminRole],
        }),
      );
    }

    // const userFactory = factoryManager.get(UserEntity);
    // await userFactory.saveMany(5);
  }
}
