import { BooleanField } from '@/decorators';

export class ReviewReportReq {
  @BooleanField()
  is_valid: boolean;
}
