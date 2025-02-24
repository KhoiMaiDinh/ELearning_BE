import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { RoleRepository } from './entities/role.repository';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity, PermissionEntity])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleRepository],
})
export class RoleModule {}
