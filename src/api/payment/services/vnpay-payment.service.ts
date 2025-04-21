import { AllConfigType } from '@/config';
import { ErrorCode } from '@/constants';
import { ValidationException } from '@/exceptions';
import { VnpayService } from '@khoimd/nestjs-vnpay';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import {
  BuildPaymentUrl,
  dateFormat,
  ProductCode,
  VnpCurrCode,
  VnpLocale,
} from 'vnpay';
import { BankRes } from '../dto/bank.res.dto';

@Injectable()
export class VnpayPaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  initRequest(order_id: string, amount: number, client_ip: string): string {
    const return_url = this.configService.get('payment.vnp_return_url', {
      infer: true,
    });

    const data: BuildPaymentUrl = {
      vnp_Amount: amount,
      vnp_CreateDate: dateFormat(new Date(), 'yyyyMMddHHmmss'),
      vnp_CurrCode: VnpCurrCode.VND,
      vnp_IpAddr: client_ip,
      vnp_Locale: VnpLocale.VN,
      vnp_OrderInfo: order_id,
      vnp_OrderType: ProductCode.Pay,
      vnp_ReturnUrl: return_url,
      vnp_TxnRef: order_id,
    };

    const vnpay_url = this.vnpayService.buildPaymentUrl(data);
    return vnpay_url;
  }

  async getBanks(): Promise<BankRes[]> {
    const banks = await this.vnpayService.getBankList();
    return plainToInstance(BankRes, banks);
  }

  async validateBankCode(bank_code: string) {
    const banks = await this.getBanks();
    const bank = banks.find((bank) => bank.bank_code === bank_code);
    if (!bank) throw new ValidationException(ErrorCode.E053);
  }
}
