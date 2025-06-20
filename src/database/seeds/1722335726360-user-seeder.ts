import { PreferenceEntity } from '@/api/preference/entities/preference.entity';
import { RoleEntity } from '@/api/role/entities/role.entity';
import { UserEntity } from '@/api/user/entities/user.entity';
import { DefaultRole, Language, RegisterMethod, Theme } from '@/constants';
import { faker } from '@faker-js/faker/locale/vi';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class UserSeeder1722335726360 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userRepo = dataSource.getRepository(UserEntity);
    const roleRepo = dataSource.getRepository(RoleEntity);
    const prefRepo = dataSource.getRepository(PreferenceEntity);

    const admin_user = await userRepo.findOneBy({ username: 'Admin' });
    const admin_role = await roleRepo.findOneByOrFail({
      role_name: DefaultRole.ADMIN,
    });

    if (!admin_user) {
      await userRepo.insert(
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

    const student_role = await roleRepo.findOneByOrFail({
      role_name: DefaultRole.STUDENT,
    });

    for (let i = 0; i < 1000; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();
      const password = 'Matkhau@123';
      const isGoogle = faker.datatype.boolean();

      const user = await userRepo.save(
        new UserEntity({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          register_method: isGoogle
            ? RegisterMethod.GOOGLE
            : RegisterMethod.LOCAL,
          google_id: isGoogle ? faker.string.uuid() : null,
          roles: [student_role],
          is_verified: isGoogle ?? faker.datatype.boolean(),
          createdAt: faker.date.between({
            from: '2023-01-01',
            to: '2025-06-15',
          }),
        }),
      );

      const preference = new PreferenceEntity({
        user_id: user.user_id,
        theme: faker.helpers.arrayElement([Theme.LIGHT, Theme.DARK]),
        language: faker.helpers.arrayElement([Language.VI, Language.EN]),
        categories: [],
      });

      await prefRepo.save(preference);
    }
  }
}
