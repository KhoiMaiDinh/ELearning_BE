import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';

export class ParseNanoidOptions {
  errorMsg?: string;
  dataKey?: string;
}

@Injectable()
export class ParseNanoidPipe implements PipeTransform {
  private errorMsg: string;
  private dataKey: string;

  constructor(@Optional() options: ParseNanoidOptions) {
    this.errorMsg = options?.errorMsg || 'Invalid nanoid';
    this.dataKey = options?.dataKey || 'id';
  }

  transform(value: string, metadata: ArgumentMetadata) {
    // extract data (key)
    const { data: isKeyGiven } = metadata;

    if (!isKeyGiven) {
      value = value[this.dataKey];
    }

    const nanoid = value;

    if (!nanoid || !/^[A-Za-z0-9_-]{13}$/.test(nanoid)) {
      const errorMsg = isKeyGiven ? `${isKeyGiven} is invalid` : this.errorMsg;

      throw new BadRequestException(errorMsg);
    }

    return nanoid;
  }
}
