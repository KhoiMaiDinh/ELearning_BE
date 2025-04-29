import { Module } from '@nestjs/common';
import { NotificationModule } from './notification/notification.module';
import { RedisIoAdapter } from './redis.adapter';

@Module({
  imports: [NotificationModule],
  providers: [RedisIoAdapter],
  exports: [RedisIoAdapter],
})
export class GatewayModule {}
