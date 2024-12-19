import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ListResponseDto<T> {
  @Expose()
  message: string;
  @Expose()
  results: T[];
}
