import { MediaReq } from '@/api/media';
import { ClassField } from '@/decorators';

export class ResourceReq {
  @ClassField(() => MediaReq)
  resource_file: MediaReq;
}
