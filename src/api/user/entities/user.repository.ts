import { Nanoid } from '@/common/index';
import { ErrorCode } from '@/constants/error-code.constant';
import { RegisterMethod } from '@/constants/register-method.enum';
import { NotFoundException } from '@/exceptions/not-found.exception';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async findOneByPublicId(id: Nanoid): Promise<UserEntity> {
    const user = await this.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException(ErrorCode.E002, 'User not found');
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
      throw new NotFoundException(ErrorCode.E002, 'User not found');
    }
    return user;
  }
}
