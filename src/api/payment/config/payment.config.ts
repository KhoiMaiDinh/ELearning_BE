import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentConfig } from './payment-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  PAYMENT_STRIPE_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_STRIPE_RETURN_URL: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_STRIPE_WEBHOOK_SECRET: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_VNP_TMN_CODE: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_VNP_HASH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_VNP_URL: string;

  @IsString()
  @IsNotEmpty()
  PAYMENT_VNP_RETURN_URL: string;
}

export default registerAs<PaymentConfig>('payment', () => {
  console.info(`Register PaymentConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    stripe_api_key: process.env.PAYMENT_STRIPE_SECRET_KEY,
    stripe_return_url: process.env.PAYMENT_STRIPE_RETURN_URL,
    stripe_webhook_secret: process.env.PAYMENT_STRIPE_WEBHOOK_SECRET,
    vnp_tmn_code: process.env.PAYMENT_VNP_TMN_CODE,
    vnp_hash_secret: process.env.PAYMENT_VNP_HASH_SECRET,
    vnp_url: process.env.PAYMENT_VNP_URL,
    vnp_return_url: process.env.PAYMENT_VNP_RETURN_URL,
  };
});
