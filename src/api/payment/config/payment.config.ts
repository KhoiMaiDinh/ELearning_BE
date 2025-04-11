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
}

export default registerAs<PaymentConfig>('payment', () => {
  console.info(`Register PaymentConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    stripe_api_key: process.env.PAYMENT_STRIPE_SECRET_KEY,
    stripe_return_url: process.env.PAYMENT_STRIPE_RETURN_URL,
  };
});
