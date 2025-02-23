import { Nanoid } from '@/common/index';

export type JwtVerificationPayloadType = {
  id: Nanoid;
  iat: number;
  exp: number;
};
