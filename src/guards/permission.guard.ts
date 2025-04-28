import { Permission } from '@/constants/permission.constant';
import { PERMISSIONS_KEY } from '@/decorators/permission.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ErrorCode } from '../constants';
import { ForbiddenException } from '../exceptions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const [req] = context.getArgs();
    const user_permissions = req?.user?.permissions;
    const required_permissions: Permission[] =
      this.reflector.get(PERMISSIONS_KEY, context.getHandler()) || [];
    const has_one_of_permissions = required_permissions.some((permission) =>
      user_permissions.includes(permission),
    );

    if (required_permissions.length && !has_one_of_permissions) {
      throw new ForbiddenException(
        ErrorCode.F001,
        'User does not have the permission to access this resource',
      );
    }

    return true;
  }
}
