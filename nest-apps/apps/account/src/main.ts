// Libs
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  HttpStatus,
  Logger,
  RequestMethod,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

// Common
import { DEFAULT_VERSION } from '@app/common';

// App
import { AccountAllConfigType } from './configs/config.type';
import { AccountModule } from './account.module';

async function bootstrap() {
  const app = await NestFactory.create(AccountModule);

  const configService = app.get(ConfigService<AccountAllConfigType>);

  const corsOrigin = configService.getOrThrow('app.corsOrigin', {
    infer: true,
  });

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: [{ method: RequestMethod.GET, path: 'health' }],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_VERSION,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(errors);
      },
    }),
  );
  // app.useGlobalFilters(new GlobalExceptionFilter(configService));
  await app.listen(configService.getOrThrow('app.port', { infer: true }));

  Logger.log(`Server running on ${await app.getUrl()}`);

  return app;
}
bootstrap();
