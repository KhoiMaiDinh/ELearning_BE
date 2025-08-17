import { OrderDetailService } from '@/api/order/services/order-detail.service';
import { IPayoutFinalizeJob, IPayoutJob } from '@/common';
import { JobName, QueueName } from '@/constants';
import { Redlock } from '@anchan828/nest-redlock';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bullmq';

const PAYOUT_CRON_SCHEDULE = '0 0 27 * *';
@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly orderDetailService: OrderDetailService,
    @InjectQueue(QueueName.PAYOUT)
    private readonly payoutQueue: Queue<
      IPayoutJob | IPayoutFinalizeJob,
      any,
      string
    >,
  ) {}

  @Cron(PAYOUT_CRON_SCHEDULE)
  @Redlock('payout-instructors')
  async payoutInstructors() {
    this.logger.debug('Payout Instructors');
    const payee_ids = await this.orderDetailService.findPayableInstructor();
    await this.payoutQueue.addBulk(
      payee_ids.map((instructor_id) => ({
        name: JobName.PAYOUT_INSTRUCTOR,
        data: {
          instructor_id,
        },
      })),
    );
    await this.payoutQueue.add(JobName.PAYOUT_FINALIZE, {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    } as IPayoutFinalizeJob);
  }
}
