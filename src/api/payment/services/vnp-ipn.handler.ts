import { OrderService } from '@/api/order/services/order.service';
import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { Injectable, Logger } from '@nestjs/common';
import {
  IpnFailChecksum,
  IpnOrderNotFound,
  IpnResponse,
  IpnSuccess,
  IpnUnknownError,
  ReturnQueryFromVNPay,
} from 'vnpay';

@Injectable()
export class VnpIpnHandler {
  constructor(
    // private readonly vnpayService: VnpayService,
    private readonly orderService: OrderService,
  ) {}

  async process(query: ReturnQueryFromVNPay): Promise<IpnResponse> {
    Logger.log(`[VNPay Ipn] Received query: ${JSON.stringify(query)}`);
    const result = true;
    if (!result) {
      return IpnFailChecksum;
    }

    const txnRef = query.vnp_TxnRef;
    const transaction_code = query.vnp_TransactionNo;
    let response: IpnResponse;
    try {
      await this.orderService.markOrderAsPaid(
        txnRef as Nanoid,
        transaction_code.toString(),
      );
      response = IpnSuccess;
    } catch (error) {
      switch (error.errorCode) {
        case ErrorCode.E045:
          response = IpnOrderNotFound;
          break;
        default:
          response = IpnUnknownError;
          break;
      }
    }

    Logger.log(
      `[VNPay Ipn] txnRef: ${txnRef}, response: ${JSON.stringify(response)}`,
    );

    return response;
  }
}
