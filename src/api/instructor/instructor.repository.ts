import { ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InstructorEntity } from './entities/instructor.entity';

@Injectable()
export class InstructorRepository extends Repository<InstructorEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(InstructorEntity, dataSource.createEntityManager());
  }

  async findOneByUsername(
    username: string,
    load_entities: string[] = [],
  ): Promise<InstructorEntity> {
    const instructor = await this.findOne({
      where: { user: { username } },
      relations: ['user', ...load_entities],
    });

    if (!instructor) {
      throw new NotFoundException(ErrorCode.E012, 'Instructor not found');
    }
    return instructor;
  }
}
