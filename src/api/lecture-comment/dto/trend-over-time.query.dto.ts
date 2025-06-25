import { Nanoid } from '@/common';
import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators';

export enum Unit {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class TrendOverTimeQuery {
  @EnumFieldOptional(() => Unit, { default: Unit.WEEK })
  unit: Unit;

  @NumberFieldOptional({ minimum: 1, default: 1 })
  count: number;

  @StringFieldOptional()
  course_id?: Nanoid;
}
