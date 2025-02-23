import { TokenField } from '@/decorators/index';

export class RefreshReq {
  @TokenField()
  refreshToken!: string;
}
