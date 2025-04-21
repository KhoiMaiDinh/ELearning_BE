import { PaymentModule } from '@/api/payment/payment.module';
import { QueueName } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PayoutQueueEvents } from './payout-queue.event';
import { PayoutProcessor } from './payout-queue.processor';
import { PayoutQueueService } from './payout-queue.service';

@Module({
  imports: [
    PaymentModule.forRootAsync(),
    BullModule.registerQueue({
      name: QueueName.PAYOUT,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
  ],
  providers: [PayoutQueueService, PayoutProcessor, PayoutQueueEvents],
})
export class PayoutQueueModule {}
