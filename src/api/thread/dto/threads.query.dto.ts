import { PageCursorOptionsDto } from '@/common';
import { Order } from '@/constants';
import { BooleanFieldOptional, EnumFieldOptional } from '@/decorators';
import { IntersectionType } from '@nestjs/swagger';

export class ThreadsQuery {
  @EnumFieldOptional(() => Order)
  order: Order;

  @BooleanFieldOptional()
  has_replied?: boolean;
}

export class CursorThreadsQuery extends IntersectionType(
  ThreadsQuery,
  PageCursorOptionsDto,
) {}
