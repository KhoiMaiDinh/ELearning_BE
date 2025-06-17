import { Expose } from 'class-transformer';

export class CategoryStatRes {
  @Expose()
  name: string;
  @Expose()
  slug: string;
  @Expose()
  course_count: number;
}
