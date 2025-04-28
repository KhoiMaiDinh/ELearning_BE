import { NumberField, StringFieldOptional } from '@/decorators';

export class SubmitReviewReq {
  @NumberField({ min: 1, max: 5 })
  rating: number;

  @StringFieldOptional({ maxLength: 100 })
  rating_comment?: string;
}
