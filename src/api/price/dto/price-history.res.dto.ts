import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PriceHistoryRes {
  @Expose()
  old_price: number;

  @Expose()
  new_price: number;
}
