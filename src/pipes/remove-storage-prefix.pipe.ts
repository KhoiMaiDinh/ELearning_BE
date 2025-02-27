import { TRANSFORM_APP_URL_KEY } from '@/decorators/transform-url.decorator';
import { MinioClientService } from '@/libs/minio';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import 'reflect-metadata';

@Injectable()
export class RemoveStoragePrefixPipe implements PipeTransform {
  constructor(private readonly storageService: MinioClientService) {}
  async transform(value: any, metadata: ArgumentMetadata) {
    if (
      !metadata.metatype ||
      metadata.type !== 'body' ||
      typeof value !== 'object'
    ) {
      return value;
    }

    const storagePath =
      process.env.STORAGE_PATH || 'http://localhost:9000/storage';

    // Check if this field has @TransformAppUrl() decorator
    const keys = Object.keys(value);
    for (const key of keys) {
      const shouldTransform = Reflect.getMetadata(
        TRANSFORM_APP_URL_KEY,
        metadata.metatype.prototype,
        key,
      );

      if (shouldTransform && typeof value[key] === 'string') {
        value[key] = value[key].replace(new RegExp(`^${storagePath}`), '');

        await this.storageService.isValidFile(value[key]);
      }
    }

    return value;
  }
}
