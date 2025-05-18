import { Nanoid } from '@/common';
import { PERMISSION } from '@/constants';

export type JwtPayloadType = {
  id: Nanoid;
  session_id: string;
  permissions: PERMISSION[];
  iat?: number;
  exp?: number;
  banned_until: Date;
};
