import { WrapperType } from '@/common';
import { ClassFieldOptional } from '@/decorators';
import { Exclude, Expose } from 'class-transformer';
import { CourseRes } from './course.res.dto';

@Exclude()
export class CourseUnbanResponseDto {
  @Expose()
  reason: string;
  @Expose()
  disapproval_reason?: string;
  @Expose()
  is_reviewed: boolean;
  @Expose()
  is_approved: boolean;
  @Expose()
  @ClassFieldOptional(() => CourseRes)
  course: WrapperType<CourseRes>;
  @Expose()
  createdAt: Date;
}
