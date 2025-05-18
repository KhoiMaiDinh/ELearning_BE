import { PermissionEntity } from '@/api/role/entities/permission.entity';
import { RoleEntity } from '@/api/role/entities/role.entity';
import { RoleRepository } from '@/api/role/repositories/role.repository';
import { RoleController } from '@/api/role/role.controller';
import { RoleService } from '@/api/role/role.service';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  imports: [
    forwardRef(() => TypeOrmModule.forFeature([RoleEntity, PermissionEntity])),
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, PermissionRepository],
  exports: [RoleRepository, RoleService],
})
export class RoleModule {}
