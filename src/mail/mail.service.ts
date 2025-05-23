import { AllConfigType } from '@/config/config.type';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmailVerification(email: string, token: string) {
    // Please replace the URL with your own frontend URL
    const url = `${this.configService.get('app.url', { infer: true })}/api/v1/auth/verify/email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Email Verification',
      template: 'email-verification',
      context: {
        email: email,
        url,
      },
    });
  }

  async sendForgotPassword(email: string, token: string) {
    // Please replace the URL with your own frontend URL
    const url = `${this.configService.get('app.url', { infer: true })}/api/v1/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Forgot Password',
      template: 'forgot-password',
      context: {
        email: email,
        url,
      },
    });
  }

  async sendCouponEmail(email: string, coupon_code: string, reason: string) {
    return this.mailerService.sendMail({
      to: email,
      subject: 'Coupon',
      template: 'coupon',
      context: {
        email: email,
        coupon_code: coupon_code,
        reason: reason,
      },
    });
  }
}
