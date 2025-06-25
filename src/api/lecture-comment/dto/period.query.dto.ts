import { AfterDateField, DateField } from '@/decorators';

export class PeriodReq {
  @DateField()
  start: Date;

  @DateField()
  @AfterDateField('start')
  end: Date;
}
