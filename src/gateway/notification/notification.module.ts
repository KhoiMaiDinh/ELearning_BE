import { TokenModule } from '@/api/token';
import { Global, Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Global()
@Module({
  imports: [TokenModule],
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationModule {}
