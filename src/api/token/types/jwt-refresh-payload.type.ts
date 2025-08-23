import { Uuid } from '@/common';

export type JwtRefreshPayloadType = {
  session_id: Uuid;
  hash: string;
  iat: number;
  exp: number;
};
