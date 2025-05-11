import { WrapperType } from '@/common';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { BanRes } from './ban.res.dto';
import { ReportRes } from './report.res.dto';

@Exclude()
export class WarningRes {
  @Expose()
  @ClassField(() => ReportRes)
  report: ReportRes;

  @Expose()
  @ClassField(() => BanRes)
  ban: WrapperType<BanRes>;
}
