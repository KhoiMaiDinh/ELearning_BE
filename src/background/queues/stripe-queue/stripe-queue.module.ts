import { PaymentModule } from '@/api/payment/payment.module';
import { QueueName, QueuePrefix } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { StripeQueueEvents } from './stripe-queue.event';
import { StripeProcessor } from './stripe-queue.processor';
import { StripeQueueService } from './stripe-queue.service';

@Module({
  imports: [
    PaymentModule.forRootAsync(),
    BullModule.registerQueue({
      name: QueueName.STRIPE,
      prefix: QueuePrefix.EVENT,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
  ],
  providers: [StripeQueueService, StripeProcessor, StripeQueueEvents],
})
export class StripeQueueModule {}
