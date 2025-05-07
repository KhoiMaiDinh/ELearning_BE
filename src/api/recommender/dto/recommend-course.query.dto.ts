import { NumberField } from '@/decorators';

export class RecommendCourseQuery {
  @NumberField({ isPositive: true, int: true })
  amount: number;
}
