import { AllConfigType } from '@/config';
import { VnpayService } from '@khoimd/nestjs-vnpay';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BuildPaymentUrl,
  dateFormat,
  ProductCode,
  VnpCurrCode,
  VnpLocale,
} from 'vnpay';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  initPaymentRequest(
    order_id: string,
    amount: number,
    client_ip: string,
  ): string {
    const return_url = this.configService.get('payment.vnpay_vnp_return_url', {
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
}
