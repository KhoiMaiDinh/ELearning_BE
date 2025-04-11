import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { OrderDetailRes } from './order-detail.res.dto';

@Exclude()
export class OrderRes {
  @Expose()
  id: string;
  @Expose()
  status: string;
  @Expose()
  transaction_id: string;
  @Expose()
  amount: number;

  @Expose()
  currency: string;
  @Expose()
  provider: string;
  @Expose()
  payment_completed_at: Date;
  @Expose()
  @ClassField(() => OrderDetailRes, { each: true })
  details: OrderDetailRes[];
}
