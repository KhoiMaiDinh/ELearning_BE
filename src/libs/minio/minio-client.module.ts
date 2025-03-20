import { AllConfigType } from '@/config';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioModule } from 'nestjs-minio-client';
import { MinioClientService } from './minio-client.service';

@Module({
  imports: [
    MinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService<AllConfigType>) => ({
        region: 'ap-southeast-1',
        endPoint: config.get('storage.host', { infer: true }),
        port: config.get('storage.port', { infer: true }),
        accessKey: config.get('storage.access_key', { infer: true }),
        secretKey: config.get('storage.secret_key', { infer: true }),
        useSSL: false,
      }),
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
