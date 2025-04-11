import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { VnpayService } from '@khoimd/nestjs-vnpay';
import { Injectable, Logger } from '@nestjs/common';
import {
  IpnFailChecksum,
  IpnOrderNotFound,
  IpnResponse,
  IpnSuccess,
  ReturnQueryFromVNPay,
} from 'vnpay';
import { OrderService } from '../order/services/order.service';

@Injectable()
export class VnpIpnHandler {
  constructor(
    private readonly vnpayService: VnpayService,
    private readonly orderService: OrderService,
  ) {}

  async process(query: ReturnQueryFromVNPay): Promise<IpnResponse> {
    Logger.log(`[VNPay Ipn] Received query: ${JSON.stringify(query)}`);
    const result = this.vnpayService.verifyIpnCall(query);
    if (!result) {
      return IpnFailChecksum;
    }

    const txnRef = query.vnp_TxnRef;
    let response: IpnResponse;
    try {
      await this.orderService.markOrderAsPaid(txnRef as Nanoid);
      response = IpnSuccess;
    } catch (error) {
      switch (error.errorCode) {
        case ErrorCode.E045:
          response = IpnOrderNotFound;
          break;
        default:
          response = IpnOrderNotFound;
          break;
      }
    }

    Logger.log(
      `[VNPay Ipn] txnRef: ${txnRef}, response: ${JSON.stringify(response)}`,
    );

    return response;
  }
}
