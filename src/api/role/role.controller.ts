import { Permission } from '@/constants/permission.constant';
import { ApiAuth } from '@/decorators/http.decorators';
import { Permissions } from '@/decorators/permission.decorator';
import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { CreateRoleReq, RoleRes, UpdateRoleReq } from './dto';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiAuth({
    type: RoleRes,
    summary: 'Get all roles',
  })
  @Permissions(Permission.READ_ROLE)
  @Get()
  async getRoles(): Promise<RoleRes[]> {
    return await this.roleService.getRoles();
  }

  @ApiAuth({
    type: RoleRes,
    summary: 'Create a new role',
  })
  @Permissions(Permission.WRITE_ROLE)
  @Post()
  async createRole(@Body() dto: CreateRoleReq): Promise<RoleRes> {
    return await this.roleService.createRole(dto);
  }

  @ApiAuth({
    type: RoleRes,
    summary: 'Change permissions and name of a role',
  })
  @Permissions(Permission.WRITE_ROLE)
  @Put(':role_name')
  @ApiParam({ name: 'role_name', type: 'String' })
  async updateRolePermissions(
    @Param('role_name') role_name: string,
    @Body()
    dto: UpdateRoleReq,
  ): Promise<RoleRes> {
    const result = await this.roleService.updateRole(role_name, dto);
    return result;
  }
}
