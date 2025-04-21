import { VnpIpnHandler } from '@/api/payment/services/vnp-ipn.handler';
import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ApiAuth, ApiPublic, CurrentUser, Public } from '@/decorators';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ReturnQueryFromVNPay } from 'vnpay';
import { AccountRes } from './dto/account.res.dto';
import { BankRes } from './dto/bank.res.dto';
import { CreateAccountReq } from './dto/create-account.req.dto';
import { UpdateAccountReq } from './dto/update-account.req.dto';
import { AccountService } from './services/account.service';
import { VnpayPaymentService } from './services/vnpay-payment.service';

@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(
    private readonly vnpayPaymentService: VnpayPaymentService,
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

  @Get('banks')
  @Public()
  @ApiPublic({
    summary: 'Get all banks',
    type: BankRes,
    statusCode: HttpStatus.OK,
  })
  async getBanks() {
    return await this.vnpayPaymentService.getBanks();
  }

  @Get('users/:id/accounts')
  @ApiAuth({
    summary: 'Get user account',
    type: AccountRes,
  })
  async getUserAccount(
    @CurrentUser() user: JwtPayloadType,
    @Query('id') id: Nanoid,
  ) {
    return await this.accountService.findFromUser(user, id);
  }

  @Post('accounts')
  @ApiAuth({
    summary: 'Create user account',
    type: AccountRes,
    statusCode: HttpStatus.CREATED,
  })
  async createUserAccount(
    @CurrentUser() user: JwtPayloadType,
    @Query('id') id: Nanoid,
    @Body() dto: CreateAccountReq,
  ) {
    return await this.accountService.create(user, dto);
  }

  @Put('users/:id/accounts')
  @ApiAuth({
    summary: 'Update user account',
    type: AccountRes,
  })
  async updateUserAccount(
    @CurrentUser() user: JwtPayloadType,
    @Query('id') id: Nanoid,
    @Body() dto: UpdateAccountReq,
  ) {
    return await this.accountService.update(user, id, dto);
  }
  // @Post('connect/stripe')
  // @ApiAuth({
  //   summary: 'Initiate Stripe Account payment',
  //   statusCode: HttpStatus.CREATED,
  //   type: String,
  // })
  // async createStripeAccount(
  //   @CurrentUser() user: JwtPayloadType,
  //   @Body() dto: InitStripeConnectAccountReq,
  // ) {
  //   return await this.accountService.initAccount(user, dto);
  // }

  // @Get('connect/stripe/refresh/:account_id')
  // @ApiAuth({
  //   summary: 'Refresh Stripe Account payment',
  //   type: String,
  // })
  // async refresh(
  //   @CurrentUser() user: JwtPayloadType,
  //   @Param('account_id') account_id: string,
  // ) {
  //   return await this.accountService.refreshAccount(user, account_id);
  // }

  // @Put('connect/stripe/:stripe_account_id')
  // @ApiAuth({
  //   summary: 'Update Stripe Account payment',
  //   type: AccountRes,
  // })
  // async updateStripeAccount(
  //   @CurrentUser() user: JwtPayloadType,
  //   @Query('stripe_account_id') stripe_account_id: string,
  //   @Body() dto: UpdateStripeAccountReq,
  // ) {
  //   return await this.accountService.updateAccount(
  //     user,
  //     stripe_account_id,
  //     dto,
  //   );
  // }
}
