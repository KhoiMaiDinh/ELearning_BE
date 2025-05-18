import { RoleRepository } from '@/api/role/repositories/role.repository';
import { ErrorCode } from '@/constants';
import { NotFoundException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { In } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { CreateRoleReq, RoleRes, UpdateRoleReq } from './dto';
import { RoleEntity } from './entities/role.entity';
import { PermissionRepository } from './repositories/permission.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  /**
   * Get all roles
   * @returns Role[]
   */
  async get(): Promise<RoleRes[]> {
    const roles = await this.roleRepository.find({
      relations: ['permissions'],
    });
    return plainToInstance(RoleRes, roles);
  }

  /**
   * Create new role
   * @param dto CreateRoleReq
   * @returns Role
   */
  async create(dto: CreateRoleReq): Promise<RoleRes> {
    const { role_name, permission_keys } = dto;
    const permissions = await this.permissionRepository.find({
      where: { permission_key: In([...permission_keys]) },
    });

    if (permissions.length !== permission_keys.length) {
      throw new NotFoundException(ErrorCode.E007, 'Permission not found');
    }

    const role = new RoleEntity({
      role_name,
      permissions,
    });

    await role.save();
    return role.toDto(RoleRes);
  }

  /**
   * Update role's permissions
   * @param role_id Role ID
   * @param dto UpdateRolePermissionsReq
   * @returns UpdateRolePermissionsRes
   **/
  async update(role_name: string, dto: UpdateRoleReq): Promise<RoleRes> {
    const role = await this.roleRepository.getRoleByRoleName(role_name);

    const [permissions, count] = await this.permissionRepository.findAndCount({
      where: { permission_key: In([...dto.permission_keys]) },
    });

    if (count !== dto.permission_keys.length) {
      throw new NotFoundException(ErrorCode.E007, 'Permission not found');
    }

    role.role_name = dto.role_name;
    role.permissions = permissions;
    await role.save();

    return role.toDto(RoleRes);
  }

  async addToUser(user: UserEntity, role_name: string) {
    const new_role = await this.roleRepository.getRoleByRoleName(role_name);
    user.roles = [...user.roles, new_role];
    await user.save();
  }
}
