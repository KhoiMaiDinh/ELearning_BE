import { CourseModule } from '@/api/course/course.module';
import { OrderModule } from '@/api/order/order.module';
import { PaymentController } from '@/api/payment/payment.controller';
import { AllConfigType } from '@/config';
import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user';
import { AccountEntity } from './entities/account.entity';
import { AccountService } from './services/account.service';
import { PaymentService } from './services/payment.service';
import { VnpIpnHandler } from './services/vpn-ipn.handler';

@Module({})
export class PaymentModule {
  static forRootAsync(): DynamicModule {
    return {
      module: PaymentModule,
      imports: [
        ConfigModule.forRoot(),
        forwardRef(() => OrderModule),
        TypeOrmModule.forFeature([AccountEntity]),
        UserModule,
        CourseModule,
      ],
      controllers: [PaymentController],
      providers: [
        AccountService,
        VnpIpnHandler,
        PaymentService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: async (configService: ConfigService<AllConfigType>) =>
            configService.get('payment.stripe_api_key', {
              infer: true,
            }),
          inject: [ConfigService],
        },
      ],
      exports: [PaymentService, AccountService],
    };
  }
}
