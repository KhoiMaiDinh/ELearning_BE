import { BooleanField, StringField } from '@/decorators';
import { ValidateIf } from 'class-validator';

export class ReviewUnbanReq {
  @BooleanField()
  approve: boolean;

  @ValidateIf((o: ReviewUnbanReq) => !o.approve)
  @StringField({ maxLength: 1000 })
  disapproval_reason: string;
}
