import { Nanoid } from '@/common';

export type JwtVerificationPayloadType = {
  id: Nanoid;
  iat: number;
  exp: number;
};
