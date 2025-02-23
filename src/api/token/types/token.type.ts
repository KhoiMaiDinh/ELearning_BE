import { Branded } from '@/common/index';

export type Token = Branded<
  {
    access_token: string;
    refresh_token: string;
    token_expires: number;
  },
  'token'
>;
