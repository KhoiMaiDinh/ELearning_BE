import { TokenModule } from '@/api/token';
import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [TokenModule],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
