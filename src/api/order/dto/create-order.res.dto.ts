import { InitPaymentRes } from '@/api/payment/dto/init-payment.res.dto';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { OrderRes } from './order.res.dto';

@Exclude()
export class CreateOrderRes {
  @Expose()
  @ClassField(() => OrderRes)
  order: OrderRes;

  @Expose()
  @ClassField(() => InitPaymentRes)
  payment: InitPaymentRes;
}
