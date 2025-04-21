import { OrderDetailService } from '@/api/order/services/order-detail.service';
import { IPayoutJob } from '@/common';
import { JobName, QueueName } from '@/constants';
import { Redlock } from '@anchan828/nest-redlock';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly orderDetailService: OrderDetailService,
    @InjectQueue(QueueName.STRIPE)
    private readonly stripeQueue: Queue<IPayoutJob, any, string>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  @Redlock('payout-instructors')
  async payoutInstructors() {
    this.logger.debug('Payout Instructors');
    const payee_ids = await this.orderDetailService.findPayableInstructor();
    await this.stripeQueue.addBulk(
      payee_ids.map((instructor_id) => ({
        name: JobName.PAYOUT_INSTRUCTOR,
        data: {
          instructor_id,
        },
      })),
    );
  }
}
