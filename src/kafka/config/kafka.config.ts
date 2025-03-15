import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { KafkaConfig } from './kafka-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  KAFKA_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(([\w]+:\/\/)?([\w.-]+)(:[0-9]+)?)?(,([\w]+:\/\/)?([\w.-]+)(:[0-9]+)?)*$/,
  )
  KAFKA_BROKERS!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_GROUP_ID!: string;
}

export default registerAs<KafkaConfig>('kafka', () => {
  console.info(`Register KafkaConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: getBrokers(),
    groupId: process.env.KAFKA_GROUP_ID,
  };
});

function getBrokers() {
  const brokers = process.env.KAFKA_BROKERS;

  return brokers.split(',').map((origin) => origin.trim());
}
