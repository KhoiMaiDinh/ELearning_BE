import { Nanoid } from '@/common';
import { Permission } from '@/constants';

export type JwtPayloadType = {
  id: Nanoid;
  session_id: string;
  permissions: Permission[];
  iat: number;
  exp: number;
};
