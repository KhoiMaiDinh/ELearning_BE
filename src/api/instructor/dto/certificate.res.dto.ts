import { MediaRes } from '@/api/media/dto/media.res.dto';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CertificateRes {
  @ClassField(() => MediaRes)
  @Expose()
  certificate_file: MediaRes;
}
