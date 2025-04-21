import { MediaRes } from '@/api/media';
import { ClassField, NumberField, StringField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LectureVideoRes {
  @Expose()
  @ClassField(() => MediaRes)
  video: MediaRes;

  @Expose()
  @NumberField()
  version: number;
}

@Exclude()
export class LectureResourceRes {
  @Expose()
  @ClassField(() => MediaRes)
  resource_file: MediaRes;

  @Expose()
  @StringField()
  name: string;
}
