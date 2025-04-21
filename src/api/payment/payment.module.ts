import { CourseModule } from '@/api/course/course.module';
import { OrderModule } from '@/api/order/order.module';
import { PaymentController } from '@/api/payment/payment.controller';
import { AllConfigType } from '@/config';
import { VnpayModule } from '@khoimd/nestjs-vnpay';
import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from '../media';
import { UserModule } from '../user';
import { AccountEntity } from './entities/account.entity';
import { PayoutEntity } from './entities/payout.entity';
import { StripeAccountEntity } from './entities/stripe-account.entity';
import { AccountService } from './services/account.service';
import { PaymentService } from './services/payment.service';
import { PayoutService } from './services/payout.service';
import { StripeAccountService } from './services/stripe-account.service';
import { VnpIpnHandler } from './services/vnp-ipn.handler';
import { VnpayPaymentService } from './services/vnpay-payment.service';

@Module({})
export class PaymentModule {
  static forRootAsync(): DynamicModule {
    return {
      module: PaymentModule,
      imports: [
        ConfigModule.forRoot(),
        forwardRef(() => OrderModule),
        TypeOrmModule.forFeature([
          StripeAccountEntity,
          PayoutEntity,
          AccountEntity,
        ]),
        UserModule,
        CourseModule,
        OrderModule,
        MediaModule,
        VnpayModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService<AllConfigType>) => ({
            secureSecret: configService.get('payment.vnp_hash_secret', {
              infer: true,
            }),
            tmnCode: configService.get('payment.vnp_tmn_code', {
              infer: true,
            }),
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [PaymentController],
      providers: [
        StripeAccountService,
        VnpIpnHandler,
        PaymentService,
        PayoutService,
        VnpayPaymentService,
        AccountService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: async (configService: ConfigService<AllConfigType>) =>
            configService.get('payment.stripe_api_key', {
              infer: true,
            }),
          inject: [ConfigService],
        },
      ],
      exports: [PaymentService, StripeAccountService, PayoutService],
    };
  }
}
