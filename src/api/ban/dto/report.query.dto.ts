import { PageOffsetOptionsDto } from '@/common';
import { BooleanFieldOptional, EnumFieldOptional } from '@/decorators';
import { WarningType } from '../enum/warning-type.enum';

export class ReportQuery extends PageOffsetOptionsDto {
  @BooleanFieldOptional()
  is_reviewed: boolean;

  @BooleanFieldOptional()
  is_valid: boolean;

  @EnumFieldOptional(() => WarningType)
  type: WarningType;
}
