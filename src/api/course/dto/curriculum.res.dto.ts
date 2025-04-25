import { SectionDetailRes } from '@/api/section';
import { ClassField, NumberField } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { CourseRes } from './course.res.dto';

@Exclude()
class CourseProgressRes {
  @Expose()
  @NumberField()
  total: number;
  @Expose()
  @NumberField()
  completed: number;
  @Expose()
  @NumberField()
  progress: number;
}

@Exclude()
export class CurriculumRes extends CourseRes {
  @Expose()
  @ClassField(() => SectionDetailRes, { each: true })
  declare sections: SectionDetailRes[];

  @Expose()
  @ClassField(() => CourseProgressRes)
  course_progress: CourseProgressRes;
}
