import { PageCursorOptionsDto } from '@/common';
import { Order } from '@/constants';
import {
  BooleanFieldOptional,
  EnumField,
  EnumFieldOptional,
} from '@/decorators';
import { IntersectionType } from '@nestjs/swagger';
import { Aspect, Emotion } from '../enum';

export class LectureCommentsQuery {
  @EnumFieldOptional(() => Aspect)
  aspect?: Aspect;

  @EnumFieldOptional(() => Emotion)
  emotion?: Emotion;

  @BooleanFieldOptional({
    description: 'Filter by solved/unsolved status (optional)',
  })
  is_solved?: boolean;

  @EnumField(() => Order, { default: Order.DESC })
  order: Order = Order.DESC;
}

export class PaginateLectureCommentsQuery extends IntersectionType(
  PageCursorOptionsDto,
  LectureCommentsQuery,
) {}
