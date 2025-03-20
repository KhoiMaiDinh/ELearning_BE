import { StringField, TransformStorageUrl } from '@/decorators';

export class MediaReq {
  @StringField()
  @TransformStorageUrl()
  key: string;
}
