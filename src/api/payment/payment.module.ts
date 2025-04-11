import { OrderModule } from '@/api/order/order.module';
import { AllConfigType } from '@/config';
import { VnpayModule } from '@khoimd/nestjs-vnpay';
import { forwardRef, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { VnpIpnHandler } from './vpn-ipn.handler';

@Module({
  imports: [
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AllConfigType>) => ({
        secureSecret: configService.get('payment.vnpay_vnp_hash_secret', {
          infer: true,
        }),
        tmnCode: configService.get('payment.vnpay_vnp_tmn_code', {
          infer: true,
        }),
        vnpUrl: configService.get('payment.vnpay_vnp_url', { infer: true }),
        loggerFn: Logger.log,
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => OrderModule),
  ],
  controllers: [PaymentController],
  providers: [VnpIpnHandler, PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
