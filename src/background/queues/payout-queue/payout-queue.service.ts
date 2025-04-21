import { PayoutService } from '@/api/payment/services/payout.service';
import { IPayoutJob } from '@/common/interfaces/job.interface';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PayoutQueueService {
  private readonly logger = new Logger(PayoutQueueService.name);

  constructor(private readonly payoutService: PayoutService) {}

  async payoutInstructor(data: IPayoutJob) {
    await this.payoutService.initForInstructor(data.instructor_id);
  }
}
