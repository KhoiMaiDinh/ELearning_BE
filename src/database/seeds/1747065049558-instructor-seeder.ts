import { InstructorEntity } from '@/api/instructor/entities/instructor.entity';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export class InstructorSeeder1747065049558 implements Seeder {
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(InstructorEntity);

    const instructors_path = path.resolve(
      __dirname,
      '../data/instructors.json',
    );
    const instructors = JSON.parse(fs.readFileSync(instructors_path, 'utf8'));

    const user_path = path.resolve(__dirname, '../data/users.json');
    const users = JSON.parse(fs.readFileSync(user_path, 'utf8'));

    for (let i = 0; i < instructors.length; i++) {
      await repository.save({
        ...instructors[i],
        user_id: users[i + 1].user_id,
        createdAt: faker.date.between({
          from: '2023-01-01',
          to: '2025-06-15',
        }),
      });
    }
  }
}
