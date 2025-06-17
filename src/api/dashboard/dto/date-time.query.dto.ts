import { NumberField } from '@/decorators';

export class YearQuery {
  @NumberField({
    minimum: 2023,
    maximum: new Date().getFullYear(),
    int: true,
    default: new Date().getFullYear(),
  })
  year: number;
}

export class MonthQuery {
  @NumberField({
    minimum: 1,
    maximum: 12,
    int: true,
    default: new Date().getMonth() + 1,
  })
  month: number;
}
