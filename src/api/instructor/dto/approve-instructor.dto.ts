import { BooleanField, StringField } from '@/decorators';
import { ValidateIf } from 'class-validator';

export class ApproveInstructorDto {
  @BooleanField()
  is_approved: boolean;

  @ValidateIf((o: ApproveInstructorDto) => !o.is_approved)
  @StringField({ required: true })
  disapproval_reason: object;
}
