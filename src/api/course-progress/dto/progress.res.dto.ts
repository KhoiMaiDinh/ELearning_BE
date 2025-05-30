import { BooleanField, NumberField } from '@/decorators';
import { Expose } from 'class-transformer';

export class ProgressRes {
  @Expose()
  @NumberField({ int: true })
  watch_time_in_percentage: number;

  @Expose()
  @BooleanField()
  completed: boolean;
}
