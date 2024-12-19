// App
import { DatabaseConfig } from '@app/database';
import { AppConfig } from './app-config.type';
import { AuthConfig } from './auth-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
};
