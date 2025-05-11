import { PageOffsetOptionsDto as PageOptionsDto } from '@/common';
import { Order } from '@/constants';
import {
  BooleanFieldOptional,
  EnumFieldOptional,
  StringFieldOptional,
} from '@/decorators';
import { ValidateIf } from 'class-validator';

export class ListInstructorQuery extends PageOptionsDto {
  @StringFieldOptional()
  specialty?: string;

  @BooleanFieldOptional()
  is_approved?: boolean;

  @EnumFieldOptional(() => Order)
  @ValidateIf((o) => o.is_approved)
  approved_at?: Order;
}
