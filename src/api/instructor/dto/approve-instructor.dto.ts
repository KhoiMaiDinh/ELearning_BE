import { BooleanField, StringField } from '@/decorators';
import { ValidateIf } from 'class-validator';

export class ApproveInstructorReq {
  @BooleanField()
  is_approved: boolean;

  @ValidateIf((o: ApproveInstructorReq) => !o.is_approved)
  @StringField({ required: true })
  disapproval_reason: string;
}
