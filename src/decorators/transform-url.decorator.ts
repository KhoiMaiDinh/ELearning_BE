import { Transform } from 'class-transformer';
import 'reflect-metadata';

export const TRANSFORM_APP_URL_KEY = 'transformAppUrl';

export function TransformStorageUrl(): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(TRANSFORM_APP_URL_KEY, true, target, propertyKey);
  };
}

export function RestoreStorageUrl(): PropertyDecorator {
  const storagePath =
    process.env.STORAGE_PATH || 'http://localhost:9000/storage';

  return Transform(({ value }) => {
    if (typeof value === 'string' && !value.startsWith(storagePath)) {
      return `${storagePath}${value}`;
    }
    return value;
  });
}
