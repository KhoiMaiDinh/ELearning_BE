import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { CourseRes } from './course.res.dto';

@Exclude()
export class CertificateResDto {
  @Expose()
  certificate_code: string;
  @Expose()
  completed_at: Date;
  @Expose()
  createdAt: Date;
  @Expose()
  @ClassField(() => CourseRes)
  course: CourseRes;
}
