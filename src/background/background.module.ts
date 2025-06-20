import { Module } from '@nestjs/common';
import { EmailQueueModule } from './queues/email-queue/email-queue.module';
import { OrderQueueModule } from './queues/order-queue/order-queue.module';
import { PayoutQueueModule } from './queues/payout-queue/payout-queue.module';
import { ProgressQueueModule } from './queues/progress-queue/progress-queue.module';
@Module({
  imports: [
    EmailQueueModule,
    PayoutQueueModule,
    OrderQueueModule,
    ProgressQueueModule,
  ],
})
export class BackgroundModule {}
