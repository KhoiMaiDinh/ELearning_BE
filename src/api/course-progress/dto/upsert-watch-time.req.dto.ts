import { NumberField } from '@/decorators';

export class UpsertWatchTimeReq {
  @NumberField({ int: true })
  watch_time: number;
}
