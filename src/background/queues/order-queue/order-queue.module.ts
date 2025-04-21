import { OrderModule } from '@/api/order/order.module';
import { QueueName } from '@/constants/job.constant';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { OrderQueueEvents } from './order-queue.event';
import { OrderProcessor } from './order-queue.processor';

@Module({
  imports: [
    OrderModule,
    BullModule.registerQueue({
      name: QueueName.ORDER,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
  ],
  providers: [OrderProcessor, OrderQueueEvents],
})
export class OrderQueueModule {}
