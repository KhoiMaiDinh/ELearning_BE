import { Bucket, UploadStatus } from '@/constants';
import { EnumField, StringField, StringFieldOptional } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MediaRes {
  @StringField()
  @Expose()
  id: string;
  @StringField()
  @Expose()
  key: string;
  @StringFieldOptional()
  @Expose()
  rejection_reason?: string;
  @EnumField(() => UploadStatus)
  @Expose()
  status: UploadStatus;
  @EnumField(() => Bucket)
  @Expose()
  bucket: Bucket;
}
