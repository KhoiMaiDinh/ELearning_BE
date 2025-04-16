import { PermissionEntity } from '@/api/role/entities/permission.entity';
import { RoleEntity } from '@/api/role/entities/role.entity';
import { RoleRepository } from '@/api/role/entities/role.repository';
import { RoleController } from '@/api/role/role.controller';
import { RoleService } from '@/api/role/role.service';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    forwardRef(() => TypeOrmModule.forFeature([RoleEntity])),
    forwardRef(() => TypeOrmModule.forFeature([PermissionEntity])),
  ],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleRepository],
})
export class RoleModule {}
