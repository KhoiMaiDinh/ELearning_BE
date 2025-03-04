import { Nanoid } from '@/common';

export type JwtPayloadType = {
  id: Nanoid;
  sessionId: string;
  iat: number;
  exp: number;
};
