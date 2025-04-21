import { Module } from '@nestjs/common';
import { EmailQueueModule } from './queues/email-queue/email-queue.module';
import { PayoutQueueModule } from './queues/payout-queue/stripe-queue.module';
@Module({
  imports: [EmailQueueModule, PayoutQueueModule],
})
export class BackgroundModule {}
