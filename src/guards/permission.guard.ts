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
    const userPermissions = req?.user?.permissions;
    const requiredPermissions: Permission[] =
      this.reflector.get(PERMISSIONS_KEY, context.getHandler()) || [];
    const hasOneOfPermissions = requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );

    if (requiredPermissions.length && !hasOneOfPermissions) {
      throw new ForbiddenException(
        ErrorCode.F001,
        'User does not have the permission to access this resource',
      );
    }

    return true;
  }
}
