import { AuthConfig } from '@/api/auth/config/auth-config.type';
import { PaymentConfig } from '@/api/payment/config/payment-config.type';
import { DatabaseConfig } from '@/database/config/database-config.type';
import { KafkaConfig } from '@/kafka';
import { MinioConfig } from '@/libs/minio/config/minio-config.type';
import { MailConfig } from '@/mail/config/mail-config.type';
import { RedisConfig } from '@/redis/config/redis-config.type';
import { AppConfig } from './app-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
  mail: MailConfig;
  storage: MinioConfig;
  kafka: KafkaConfig;
  payment: PaymentConfig;
};
