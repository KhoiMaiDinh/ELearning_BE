import {
  IGiveCouponJob,
  IVerifyEmailJob,
} from '@/common/interfaces/job.interface';
import { MailService } from '@/mail/mail.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(private readonly mailService: MailService) {}

  async sendEmailVerification(data: IVerifyEmailJob): Promise<void> {
    this.logger.debug(`Sending email verification to ${data.email}`);
    await this.mailService.sendEmailVerification(data.email, data.token);
  }

  async sendForgotPassword(data: IVerifyEmailJob): Promise<void> {
    this.logger.debug(`Sending forgot password to ${data.email}`);
    await this.mailService.sendForgotPassword(data.email, data.token);
  }

  async sendCoupon(data: IGiveCouponJob): Promise<void> {
    this.logger.debug(`Sending coupon to ${data.email}`);
    await this.mailService.sendCouponEmail(
      data.email,
      data.coupon_code,
      data.reason,
    );
  }
}
