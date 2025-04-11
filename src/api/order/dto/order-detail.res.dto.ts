import { CourseRes } from '@/api/course';
import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OrderDetailRes {
  @Expose()
  id: string;
  @Expose()
  price: number;
  @Expose()
  discount: number;
  @Expose()
  final_price: number;
  @Expose()
  @ClassField(() => CourseRes)
  course: CourseRes;
}
