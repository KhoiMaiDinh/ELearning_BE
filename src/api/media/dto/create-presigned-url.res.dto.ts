import { UploadResource } from '@/constants';
import { EnumField, StringField } from '@/decorators';

export class CreatePresignedUrlReq {
  @StringField()
  filename: string;
  @EnumField(() => UploadResource)
  resource: UploadResource;
}
