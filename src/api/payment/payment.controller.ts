import { PaymentService } from '@/api/payment/payment.service';
import { ApiAuth, ApiPublic, CurrentUser, Public } from '@/decorators';
import { Controller, Get, Query } from '@nestjs/common';
import { ReturnQueryFromVNPay } from 'vnpay';
import { JwtPayloadType } from '../token';
import { VnpIpnHandler } from './vpn-ipn.handler';

@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly ipnHandler: VnpIpnHandler,
  ) {}

  @Get('vnpay_ipn')
  @Public()
  @ApiPublic({
    summary: 'VNPay IPN callback',
  })
  async vnpCallback(@Query() query: ReturnQueryFromVNPay) {
    const result = await this.ipnHandler.process(query);

    return result;
  }

  @Get('stripe/account')
  @ApiAuth({
    summary: 'Initiate Stripe Account payment',
  })
  async createStripeAccount(@CurrentUser() user: JwtPayloadType) {
    return await this.paymentService.initAccount(user);
  }
}
