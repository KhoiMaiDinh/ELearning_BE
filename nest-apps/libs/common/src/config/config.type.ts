// App
import { DatabaseConfig } from '@app/database';
import { AppConfig } from '../../../../libs/common/src/config/app-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
};
