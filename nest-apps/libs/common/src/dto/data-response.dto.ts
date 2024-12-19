import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DataResponseDto<T> {
  @Expose()
  message: string;
  @Expose()
  data: T;
}
