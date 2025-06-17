import { CursorPaginatedDto, CursorPaginationDto } from '@/common';
import { NumberField } from '@/decorators';
import { NotificationRes } from './notification.res.dto';

export class NotificationPaginationResDto extends CursorPaginatedDto<NotificationRes> {
  @NumberField()
  unseen_count: number;

  constructor(
    data: NotificationRes[],
    pagination: CursorPaginationDto,
    unseen_count: number,
  ) {
    super(data, pagination);
    this.unseen_count = unseen_count;
  }
}
