import { ApiModule } from '@app/account/src/api/api.module';
// import authConfig from '@/api/auth/config/auth.config';
import appConfig from '@app/common/config/app.config';
import { TypeOrmConfigService } from '../database/typeorm-config.service';
import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { DataSource, DataSourceOptions } from 'typeorm';
import loggerFactory from '../../../../libs/common/src/utils/logger-factory';
import databaseConfig from '@app/database/typeorm/config/database.config';

function generateModulesSet() {
  const imports: ModuleMetadata['imports'] = [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['apps/account/.env'],
    }),
  ];
  let customModules: ModuleMetadata['imports'] = [];

  const dbModule = TypeOrmModule.forRootAsync({
    useClass: TypeOrmConfigService,
    dataSourceFactory: async (options: DataSourceOptions) => {
      if (!options) {
        throw new Error('Invalid options passed');
      }

      return new DataSource(options).initialize();
    },
  });

  const loggerModule = LoggerModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: loggerFactory,
  });

  customModules = [ApiModule, dbModule, loggerModule];

  return imports.concat(customModules);
}

export default generateModulesSet;
