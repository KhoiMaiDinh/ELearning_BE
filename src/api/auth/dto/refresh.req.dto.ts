import { TokenField } from '@/decorators';

export class RefreshReq {
  @TokenField()
  refreshToken!: string;
}
