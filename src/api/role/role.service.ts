import { ErrorCode } from '@/constants/error-code.constant';
import { NotFoundException } from '@/exceptions/not-found.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { In, Repository } from 'typeorm';
import { CreateRoleReq, RoleRes, UpdateRoleReq } from './dto';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RoleRepository } from './entities/role.repository';

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  /**
   * Get all roles
   * @returns Role[]
   */
  async getRoles(): Promise<RoleRes[]> {
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
  async createRole(dto: CreateRoleReq): Promise<RoleRes> {
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
  async updateRole(role_name: string, dto: UpdateRoleReq): Promise<RoleRes> {
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
}
