import { Nanoid } from '@/common';
import { Expose } from 'class-transformer';
import { NotificationType } from '../enum/notification-type.enum';

// @Exclude()
export class NotificationRes {
  @Expose()
  title: string;
  @Expose()
  body: string;
  @Expose()
  id: Nanoid;
  @Expose()
  createdAt: Date;
  @Expose()
  type: NotificationType;
  // @Expose()
}
