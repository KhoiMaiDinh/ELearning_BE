import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RoleEntity } from './role.entity';

@Injectable()
export class RoleRepository extends Repository<RoleEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(RoleEntity, dataSource.createEntityManager());
  }

  async getRoleByRoleName(roleName: string): Promise<RoleEntity> {
    const role = await this.findOneBy({ role_name: roleName });
    if (!role) {
      throw new InternalServerErrorException(
        ErrorCode.E006,
        `Role with name ${roleName} not found`,
      );
    }
    return role;
  }
}
