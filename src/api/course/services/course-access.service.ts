import { CourseEntity } from '@/api/course/entities/course.entity';
import { JwtPayloadType } from '@/api/token';
import { ErrorCode, Permission } from '@/constants';
import { ForbiddenException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { EnrollCourseService } from './enroll-course.service';

@Injectable()
export class CourseAccessService {
  constructor(private readonly enrollCourseService: EnrollCourseService) {}

  async assertCanViewCurriculum(user: JwtPayloadType, course: CourseEntity) {
    if (user.id === course.instructor.user.id) return true;

    if (user.permissions.includes(Permission.READ_COURSE)) {
      const isEnrolled = await this.enrollCourseService.isEnrolled(
        course.course_id,
        user.id,
      );
      if (isEnrolled) return true;
    }

    throw new ForbiddenException(ErrorCode.F002);
  }
}
