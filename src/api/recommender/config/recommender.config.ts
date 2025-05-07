import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';
import { RecommenderConfig } from './recommender-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  @IsNotEmpty()
  RECOMMENDER_BASE_URL: string;
}

export default registerAs<RecommenderConfig>('third_party', () => {
  console.info(`Register RecommenderConfig from environment variables`);
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    base_url: process.env.RECOMMENDER_BASE_URL,
  };
});
