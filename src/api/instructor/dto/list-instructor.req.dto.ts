import { PageOffsetOptionsDto as PageOptionsDto } from '@/common';
import { BooleanFieldOptional, StringFieldOptional } from '@/decorators';

export class ListInstructorQuery extends PageOptionsDto {
  @StringFieldOptional()
  specialty?: string;

  @BooleanFieldOptional()
  is_approved?: boolean;
}

