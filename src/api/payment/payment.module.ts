import { OrderModule } from '@/api/order/order.module';
import { AllConfigType } from '@/config';
import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AccountEntity } from './entities/account.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { VnpIpnHandler } from './vpn-ipn.handler';

@Module({})
export class PaymentModule {
  static forRootAsync(): DynamicModule {
    return {
      module: PaymentModule,
      imports: [
        ConfigModule.forRoot(),
        forwardRef(() => OrderModule),
        TypeOrmModule.forFeature([AccountEntity, UserEntity]),
      ],
      controllers: [PaymentController],
      providers: [
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
      exports: [PaymentService],
    };
  }
}
