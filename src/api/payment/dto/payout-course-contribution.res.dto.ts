import { NumberField, StringField } from '@/decorators';

export class PayoutCourseContributionRes {
  @StringField()
  course_title: string;

  @NumberField()
  final_price: number;

  @NumberField()
  platform_fee: number;

  @NumberField()
  net_revenue: number;
}
