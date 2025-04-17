import { PaymentService } from '@/api/payment/services/payment.service';
import { VnpIpnHandler } from '@/api/payment/services/vpn-ipn.handler';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, ApiPublic, CurrentUser, Public } from '@/decorators';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ReturnQueryFromVNPay } from 'vnpay';
import { AccountRes } from './dto/account.res.dto';
import { InitStripeConnectAccountReq } from './dto/init-stripe-connect-account.req.dto';
import { UpdateStripeAccountReq } from './dto/update-stripe-account.req.dto';
import { AccountService } from './services/account.service';

@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly accountService: AccountService,
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

  @Get('users/:id/accounts')
  @ApiAuth({
    summary: 'Get all accounts of user',
    type: AccountRes,
  })
  async getAllAccounts(
    @CurrentUser() user: JwtPayloadType,
    @Query('id') id: Nanoid,
  ) {
    return await this.accountService.findFromUsers(user, id);
  }

  @Post('connect/stripe')
  @ApiAuth({
    summary: 'Initiate Stripe Account payment',
    type: String,
  })
  async createStripeAccount(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: InitStripeConnectAccountReq,
  ) {
    return await this.accountService.initAccount(user, dto);
  }

  @Get('connect/stripe/refresh/:account_id')
  @ApiAuth({
    summary: 'Refresh Stripe Account payment',
    type: String,
  })
  async refresh(
    @CurrentUser() user: JwtPayloadType,
    @Param('account_id') account_id: string,
  ) {
    return await this.accountService.refreshAccount(user, account_id);
  }

  @Put('connect/stripe/:stripe_account_id')
  @ApiAuth({
    summary: 'Update Stripe Account payment',
    type: AccountRes,
  })
  async updateStripeAccount(
    @CurrentUser() user: JwtPayloadType,
    @Query('stripe_account_id') stripe_account_id: string,
    @Body() dto: UpdateStripeAccountReq,
  ) {
    return await this.accountService.updateAccount(
      user,
      stripe_account_id,
      dto,
    );
  }
}
