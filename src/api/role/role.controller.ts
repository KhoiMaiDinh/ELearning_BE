import { PERMISSION } from '@/constants/permission.constant';
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
  @Permissions(PERMISSION.READ_ROLE)
  @Get()
  async getRoles(): Promise<RoleRes[]> {
    return await this.roleService.get();
  }

  @ApiAuth({
    type: RoleRes,
    summary: 'Create a new role',
  })
  @Permissions(PERMISSION.WRITE_ROLE)
  @Post()
  async createRole(@Body() dto: CreateRoleReq): Promise<RoleRes> {
    return await this.roleService.create(dto);
  }

  @ApiAuth({
    type: RoleRes,
    summary: 'Change permissions and name of a role',
  })
  @Permissions(PERMISSION.WRITE_ROLE)
  @Put(':role_name')
  @ApiParam({ name: 'role_name', type: 'String' })
  async updateRolePermissions(
    @Param('role_name') role_name: string,
    @Body()
    dto: UpdateRoleReq,
  ): Promise<RoleRes> {
    const result = await this.roleService.update(role_name, dto);
    return result;
  }
}
