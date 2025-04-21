import { MediaReq } from '@/api/media';
import { ClassField, StringField } from '@/decorators';

export class ResourceReq {
  @ClassField(() => MediaReq)
  resource_file: MediaReq;

  @StringField()
  name: string;
}
