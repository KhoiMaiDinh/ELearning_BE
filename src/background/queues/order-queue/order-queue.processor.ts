import { OrderService } from '@/api/order/services/order.service';
import { IHandleOrderExpirationJob } from '@/common';
import { JobName, QueueName } from '@/constants/job.constant';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor(QueueName.ORDER, {
  concurrency: 5,
  drainDelay: 300,
  stalledInterval: 300000,
  removeOnComplete: {
    age: 86400,
    count: 100,
  },
  limiter: {
    max: 1,
    duration: 150,
  },
})
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);
  constructor(private readonly orderService: OrderService) {
    super();
  }
  async process(
    job: Job<IHandleOrderExpirationJob, any, string>,
    _token?: string,
  ): Promise<any> {
    this.logger.debug(
      `Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}...`,
    );

    switch (job.name) {
      case JobName.HANDLE_ORDER_EXPIRATION:
        return await this.orderService.handleExpiration(job.data.order_id);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  @OnWorkerEvent('active')
  async onActive(job: Job) {
    this.logger.debug(`Job ${job.id} is now active`);
  }

  @OnWorkerEvent('progress')
  async onProgress(job: Job) {
    this.logger.debug(`Job ${job.id} is ${job.progress}% complete`);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} has been completed`);
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job) {
    this.logger.error(
      `Job ${job.id} has failed with reason: ${job.failedReason}`,
    );
    this.logger.error(job.stacktrace);
  }

  @OnWorkerEvent('stalled')
  async onStalled(job: Job) {
    this.logger.error(`Job ${job.id} has been stalled`);
  }

  @OnWorkerEvent('error')
  async onError(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} has failed with error: ${error?.message}`);
  }
}
