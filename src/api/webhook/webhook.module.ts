import { OrderModule } from '@/api/order/order.module';
import { PaymentModule } from '@/api/payment/payment.module';
import { AllConfigType } from '@/config';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

@Module({
  controllers: [],
})
export class WebhookModule {
  static forRootAsync(): DynamicModule {
    return {
      module: WebhookModule,
      imports: [
        ConfigModule.forRoot(),
        PaymentModule.forRootAsync(),
        OrderModule,
      ],
      controllers: [WebhookController],
      providers: [
        WebhookService,
        {
          provide: 'STRIPE_API_KEY',
          useFactory: async (configService: ConfigService<AllConfigType>) =>
            configService.get('payment.stripe_api_key', {
              infer: true,
            }),
          inject: [ConfigService],
        },
      ],
    };
  }
}
