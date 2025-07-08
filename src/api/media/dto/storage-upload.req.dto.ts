import { Nanoid } from '@/common';
import { Bucket } from '@/constants';
import { EnumField, StringField } from '@/decorators';

export class StorageUploadReq {
  @EnumField(() => Bucket)
  bucket: Bucket;
  @StringField()
  key: Nanoid;
}
