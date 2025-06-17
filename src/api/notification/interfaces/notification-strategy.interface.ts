import { Language } from '@/constants';
import { NotificationEntity } from '../entities/notification.entity';

export interface INotificationStrategy {
  validate(metadata: any): boolean;

  buildContent(
    notification: NotificationEntity,
    lang: Language,
  ): Promise<{ title: string; body: string; image?: string }>;
}
