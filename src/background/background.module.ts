import { Module } from '@nestjs/common';
import { EmailQueueModule } from './queues/email-queue/email-queue.module';
import { StripeQueueModule } from './queues/stripe-queue/stripe-queue.module';
@Module({
  imports: [EmailQueueModule, StripeQueueModule],
})
export class BackgroundModule {}
