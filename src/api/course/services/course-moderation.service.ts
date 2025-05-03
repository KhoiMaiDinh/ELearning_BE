import { JwtPayloadType } from '@/api/token';
import { Nanoid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestCourseUnbanReq, ReviewUnbanReq } from '../dto';
import { CourseUnbanRequestEntity } from '../entities/course-unban-request.entity';
import { CourseRepository } from '../repositories/course.repository';
import { CourseService } from './course.service';

@Injectable()
export class CourseModerationService {
  constructor(
    @InjectRepository(CourseUnbanRequestEntity)
    private unbanRequestRepo: Repository<CourseUnbanRequestEntity>,
    private courseRepo: CourseRepository,
    private courseService: CourseService,
  ) {}

  async requestUnban(
    course_id: Nanoid,
    user: JwtPayloadType,
    data: RequestCourseUnbanReq,
  ) {
    const { reason } = data;
    const course = await this.courseRepo.findOne({
      where: { id: course_id },
      relations: { instructor: { user: true } },
    });
    if (!course) throw new NotFoundException(ErrorCode.E025);
    if (course.instructor.user.id !== user.id)
      throw new ValidationException(ErrorCode.E076);

    const existing = await this.unbanRequestRepo.findOne({
      where: {
        course: course,
        is_reviewed: false,
      },
    });

    if (existing) throw new ValidationException(ErrorCode.E074);

    const request = this.unbanRequestRepo.create({
      course,
      reason,
    });

    return await this.unbanRequestRepo.save(request);
  }

  async reviewUnbanRequest(course_id: Nanoid, data: ReviewUnbanReq) {
    const request = await this.unbanRequestRepo.findOne({
      where: { course: { id: course_id }, is_reviewed: false },
      relations: { course: true },
    });
    if (!request) throw new NotFoundException(ErrorCode.E075);

    const { disapproval_reason, approve } = data;
    request.is_reviewed = true;
    request.is_approved = approve;
    request.disapproval_reason = approve ? null : disapproval_reason;

    if (approve) {
      await this.courseService.unban(request.course.id);
    }

    return await this.unbanRequestRepo.save(request);
  }
}
