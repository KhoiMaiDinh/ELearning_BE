import { ClassField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { CourseRes } from './course.res.dto';

@Exclude()
export class FavoriteCourseRes {
  @Expose()
  @ClassField(() => CourseRes)
  course: CourseRes;
}
