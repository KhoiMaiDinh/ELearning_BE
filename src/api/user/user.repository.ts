import { UserEntity } from '@/api/user';
import { Nanoid } from '@/common';
import { ErrorCode, RegisterMethod } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async findOneByPublicId(
    id: Nanoid,
    load_instructor = false,
  ): Promise<UserEntity> {
    const user = await this.findOne({
      where: { id },
      relations: load_instructor ? ['instructor_profile'] : [],
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.E002);
    }

    return user;
  }

  async findOneByEmail(
    email: string,
    register_method: RegisterMethod,
    load_roles = false,
  ): Promise<UserEntity> {
    const user = await this.findOne({
      where: { email, register_method },
      relations: load_roles ? ['roles', 'roles.permissions'] : [],
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.E002);
    }
    return user;
  }

  async findOneByUsername(
    username: string,
    load_instructor = false,
  ): Promise<UserEntity> {
    const user = await this.findOne({
      where: { username },
      relations: load_instructor ? ['instructor'] : [],
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.E002);
    }
    return user;
  }
}
