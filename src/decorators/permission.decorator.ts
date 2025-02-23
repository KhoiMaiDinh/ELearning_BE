import { Permission } from '@/constants/permission.constant';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Custom decorator to set required permissions on a route.
 * @param permissions List of required permissions.
 */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
