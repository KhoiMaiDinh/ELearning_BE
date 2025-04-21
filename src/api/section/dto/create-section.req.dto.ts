import { CourseReq } from '@/api/course/dto/course.req.dto';
import { Nanoid } from '@/common';
import { ClassField, StringField, StringFieldOptional } from '@/decorators';
import { PickType } from '@nestjs/swagger';

class IdCourseReq extends PickType(CourseReq, ['id']) {}

export class CreateSectionReq {
  @StringField()
  title: string;

  @StringFieldOptional()
  previous_section_id: Nanoid;

  @ClassField(() => IdCourseReq)
  course: IdCourseReq;

  @StringField({ nullable: true })
  description: string;
}
