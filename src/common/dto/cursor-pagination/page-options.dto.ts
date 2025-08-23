import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional,
} from '@/decorators/field.decorators';
import { DEFAULT_PAGE_LIMIT, Order } from '../../../constants';

export class PageCursorOptionsDto {
  @StringFieldOptional()
  afterCursor?: string;

  @StringFieldOptional()
  beforeCursor?: string;

  @NumberFieldOptional({
    min: 1,
    default: DEFAULT_PAGE_LIMIT,
    int: true,
  })
  readonly limit?: number = DEFAULT_PAGE_LIMIT;

  @EnumFieldOptional(() => Order, { default: Order.DESC })
  readonly order: Order;

  @StringFieldOptional()
  readonly q?: string;
}
