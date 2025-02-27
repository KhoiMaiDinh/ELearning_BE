import { BooleanField, ObjectField } from '@/decorators';
import { ValidateIf } from 'class-validator';

export class ApproveInstructorDto {
  @BooleanField()
  is_approved: boolean;

  @ValidateIf((o: ApproveInstructorDto) => !o.is_approved)
  @ObjectField({ required: true })
  disapproval_reason: object;
}
