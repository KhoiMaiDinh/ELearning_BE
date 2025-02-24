import { Uuid } from '@/common';

export type JwtRefreshPayloadType = {
  sessionId: Uuid;
  hash: string;
  iat: number;
  exp: number;
};
