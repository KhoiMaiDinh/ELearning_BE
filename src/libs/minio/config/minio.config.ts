import { Environment } from '@/constants';
import { IsMs } from '@/decorators';
import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import process from 'node:process';
import { MinioConfig } from './minio-config.type';
class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  STORAGE_ACCESS_KEY: Environment;

  @IsString()
  @IsNotEmpty()
  STORAGE_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsNotEmpty()
  STORAGE_PORT: number;

  @IsString()
  @IsNotEmpty()
  STORAGE_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  @IsMs()
  STORAGE_URL_EXPIRES_IN: string;

  @IsString()
  @IsNotEmpty()
  STORAGE_PATH: string;

  @IsBoolean()
  @IsNotEmpty()
  STORAGE_USE_SSL: boolean;

  @IsString()
  @IsNotEmpty()
  STORAGE_REGION: string;
}

export default registerAs<MinioConfig>('storage', () => {
  console.info(`Register MinioConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  const port = process.env.STORAGE_PORT
    ? parseInt(process.env.STORAGE_PORT, 10)
    : 9000;

  return {
    access_key: process.env.STORAGE_ACCESS_KEY,
    secret_key: process.env.STORAGE_SECRET_KEY,
    host: process.env.STORAGE_HOST,
    port,
    bucket: process.env.STORAGE_BUCKET,
    presigned_url_expires: process.env.STORAGE_URL_EXPIRES_IN,
    path: process.env.STORAGE_PATH,
    use_ssl: process.env.STORAGE_USE_SSL === 'true',
    region: process.env.STORAGE_REGION,
  };
});
