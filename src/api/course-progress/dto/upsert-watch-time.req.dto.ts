import { NumberField } from '@/decorators';

export class UpsertWatchTimeReq {
  @NumberField({ min: 1, max: 100 })
  watch_time: number;
}
