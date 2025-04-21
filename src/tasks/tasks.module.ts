import { OrderModule } from '@/api/order/order.module';
import { AllConfigType } from '@/config';
import { QueueName } from '@/constants';
import { RedlockModule } from '@anchan828/nest-redlock';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import Redis from 'ioredis';
import { TaskService } from './task.service';

@Module({
  imports: [
    OrderModule,
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: QueueName.PAYOUT,
      streams: {
        events: {
          maxLen: 1000,
        },
      },
    }),
    RedlockModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        clients: [
          new Redis({
            host: configService.get('redis.host', { infer: true }),
            port: configService.get('redis.port', { infer: true }),
            password: configService.get('redis.password', { infer: true }),
            tls: configService.get('redis.tlsEnabled', { infer: true }),
          }),
        ],
        settings: {
          driftFactor: 0.01,
          retryCount: 10,
          retryDelay: 200,
          retryJitter: 200,
          automaticExtensionThreshold: 500,
        },
        duration: 1000,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TaskService],
})
export class TasksModule {}
