import { PaymentStatus } from '@/api/payment/enums/payment-status.enum';
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
  total_amount: number;

  @Expose()
  currency: string;
  @Expose()
  provider: string;
  @Expose()
  payment_status: PaymentStatus;
  @Expose()
  @ClassField(() => OrderDetailRes, { each: true })
  details: OrderDetailRes[];

  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
