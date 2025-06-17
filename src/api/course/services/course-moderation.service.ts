import { WarningService } from '@/api/ban/services/warning.service';
import { NotificationType } from '@/api/notification/enum/notification-type.enum';
import { NotificationBuilderService } from '@/api/notification/notification-builder.service';
import { NotificationService } from '@/api/notification/notification.service';
import { JwtPayloadType } from '@/api/token';
import { UserEntity } from '@/api/user/entities/user.entity';
import { UserService } from '@/api/user/user.service';
import { Nanoid, Uuid } from '@/common';
import { ErrorCode } from '@/constants';
import { NotFoundException, ValidationException } from '@/exceptions';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { paginate } from '@/utils';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RequestCourseUnbanReq,
  ReviewUnbanReq,
  UnbanRequestQuery,
} from '../dto';
import { CourseUnbanRequestEntity } from '../entities/course-unban-request.entity';
import { CourseEntity } from '../entities/course.entity';
import { CourseStatus } from '../enums';
import { CourseRepository } from '../repositories/course.repository';
import { CourseService } from './course.service';
import { EnrollCourseService } from './enroll-course.service';

@Injectable()
export class CourseModerationService {
  constructor(
    @InjectRepository(CourseUnbanRequestEntity)
    private unbanRequestRepo: Repository<CourseUnbanRequestEntity>,
    private courseRepo: CourseRepository,
    private courseService: CourseService,
    private warningService: WarningService,
    private userService: UserService,
    private readonly enrolledService: EnrollCourseService,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async getCourseUnbanRequests(course_id: Nanoid) {
    const unban_request = await this.unbanRequestRepo.find({
      where: {
        course: { id: course_id },
      },
      relations: { course: true },
    });
    if (!unban_request) throw new NotFoundException(ErrorCode.E075);
    return unban_request;
  }

  async getUnbanRequests(filter: UnbanRequestQuery) {
    const query_builder = this.courseRepo
      .createQueryBuilder('course')
      .where('course.status = :status', { status: CourseStatus.BANNED })
      .innerJoinAndSelect('course.unban_requests', 'unban_requests')
      .leftJoinAndSelect('course.warnings', 'warnings')
      .leftJoinAndSelect('warnings.report', 'report')
      .leftJoinAndSelect('course.instructor', 'instructor');

    query_builder.orderBy('unban_requests.createdAt', filter.order);

    const [course_with_unban_requests, metaDto] = await paginate<CourseEntity>(
      query_builder,
      filter,
      {
        skipCount: false,
        takeAll: false,
      },
    );
    return {
      course_with_unban_requests,
      meta: metaDto,
    };
  }

  async requestUnban(
    course_id: Nanoid,
    user: JwtPayloadType,
    data: RequestCourseUnbanReq,
  ) {
    const { reason } = data;
    const course = await this.courseRepo.findOne({
      where: { id: course_id },
      relations: { instructor: { user: true }, thumbnail: true },
    });
    if (!course) throw new NotFoundException(ErrorCode.E025);
    if (course.instructor.user.id !== user.id)
      throw new ValidationException(ErrorCode.E076);

    const existing = await this.unbanRequestRepo.findOne({
      where: {
        course_id: course.course_id,
        is_reviewed: false,
      },
    });

    if (existing) throw new ValidationException(ErrorCode.E074);

    const request = this.unbanRequestRepo.create({
      course,
      reason,
    });
    await this.sendUnbanRequestNotification(course);

    return await this.unbanRequestRepo.save(request);
  }

  async reviewUnbanRequest(course_id: Nanoid, data: ReviewUnbanReq) {
    const request = await this.unbanRequestRepo.findOne({
      where: { course: { id: course_id }, is_reviewed: false },
      relations: { course: { instructor: { user: true } } },
    });
    if (!request) throw new NotFoundException(ErrorCode.E075);

    const { disapproval_reason, approve } = data;
    request.is_reviewed = true;
    request.is_approved = approve;
    request.disapproval_reason = approve ? null : disapproval_reason;

    if (approve) {
      await this.courseService.unban(request.course.id);
      await this.warningService.resolveCourseWarning(request.course.course_id);
      await this.removeCourseUnbanRequest(request.course.course_id);
      await this.sendCourseUnbannedNotification(request.course);
      await this.sendUnbanApprovedNotification(
        request.course.instructor.user,
        request.course,
      );
    } else {
      await this.sendUnbanRejectedNotification(
        request.course.instructor.user,
        request.course,
      );
      await this.unbanRequestRepo.save(request);
    }
  }

  private async removeCourseUnbanRequest(course_id: Uuid) {
    const requests = await this.unbanRequestRepo.find({
      where: { course_id },
    });
    if (requests.length) await this.unbanRequestRepo.softRemove(requests);
  }

  private async sendUnbanRequestNotification(course: CourseEntity) {
    const admins = await this.userService.findAdmins();
    const built_notification = this.notificationBuilder.unbanRequest(course);
    for (const admin of admins) {
      const notification = await this.notificationService.save(
        admin.user_id,
        NotificationType.UNBAN_REQUEST,
        {
          course_id: course.id,
        },
        {
          title: 'Yêu cầu mở khóa khóa học',
          body: `Giảng viên của khóa học ${course.title} đã gửi yêu cầu mở khóa khóa học.`,
        },
      );
      this.notificationGateway.emitToUser(admin.id, {
        ...notification,
        ...built_notification,
      });
    }
  }

  private async sendUnbanApprovedNotification(
    user: UserEntity,
    course: CourseEntity,
  ) {
    const built_notification = this.notificationBuilder.unbanApproved(course);
    const notification = await this.notificationService.save(
      user.user_id,
      NotificationType.UNBAN_APPROVED,
      {
        course_id: course.id,
      },
      built_notification,
    );
    this.notificationGateway.emitToUser(user.id, {
      ...notification,
      ...built_notification,
    });
    this.notificationGateway.emitToUser(user.id, {
      ...notification,
      ...built_notification,
    });
  }

  private async sendUnbanRejectedNotification(
    user: UserEntity,
    course: CourseEntity,
  ) {
    const built_notification = this.notificationBuilder.unbanRejected(course);
    const notification = await this.notificationService.save(
      user.user_id,
      NotificationType.UNBAN_REJECTED,
      {
        course_id: course.id,
      },
      built_notification,
    );
    this.notificationGateway.emitToUser(user.id, {
      ...notification,
      ...built_notification,
    });
  }

  private async sendCourseUnbannedNotification(course: CourseEntity) {
    const enrolled_users = await this.enrolledService.findEnrolledUsers(
      course.course_id,
    );
    const built_notification = this.notificationBuilder.courseUnbanned(course);
    for (const user of enrolled_users) {
      const notification = await this.notificationService.save(
        user.user_id,
        NotificationType.COURSE_UNBANNED,
        {
          course_id: course.id,
        },
        built_notification,
      );
      this.notificationGateway.emitToUser(user.id, {
        ...notification,
        ...built_notification,
      });
    }
  }
}
