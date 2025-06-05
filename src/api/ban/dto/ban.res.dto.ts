import { UserRes } from '@/api/user';
import { WrapperType } from '@/common';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { WarningRes } from './warning.res.dto';

@Exclude()
export class BanRes {
  @Expose()
  @ClassField(() => UserRes)
  user: UserRes;

  @Expose()
  expires_at: string;

  @Expose()
  is_active: boolean;

  @Expose()
  @ClassField(() => WarningRes)
  warnings: WrapperType<WarningRes>;

  @Expose()
  createdAt: Date;
}
