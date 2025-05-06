import { PageOffsetOptionsDto } from '@/common';
import { BooleanFieldOptional } from '@/decorators';

export class ReportQuery extends PageOffsetOptionsDto {
  @BooleanFieldOptional()
  is_reviewed: boolean;
}
