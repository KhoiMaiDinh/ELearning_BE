import { Nanoid, OffsetPaginatedDto, PageOffsetOptionsDto } from '@/common';
import { NotificationGateway } from '@/gateway/notification/notification.gateway';
import { paginate } from '@/utils';
import { Injectable } from '@nestjs/common';
import { CourseEntity } from '../course/entities/course.entity';
import { CourseRepository } from '../course/repositories/course.repository';
import { EnrollCourseService } from '../course/services/enroll-course.service';
import { NotificationType } from '../notification/enum/notification-type.enum';
import { NotificationBuilderService } from '../notification/notification-builder.service';
import { NotificationService } from '../notification/notification.service';
import { CreateCourseNotificationReq } from './dto';
import { CourseNotificationEntity } from './entities/course-notification.entity';
import { CourseNotificationRepository } from './repositories/course-notification.repository';

@Injectable()
export class CourseAnnouncementService {
  constructor(
    private notificationRepo: CourseNotificationRepository,
    private courseRepo: CourseRepository,
    private readonly enrollCourseService: EnrollCourseService,

    private readonly notificationService: NotificationService,
    private readonly notificationBuilder: NotificationBuilderService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(
    course_id: Nanoid,
    dto: CreateCourseNotificationReq,
  ): Promise<CourseNotificationEntity> {
    const course = await this.courseRepo.findOneByPublicIdOrSlug(course_id, {
      instructor: true,
    });
    const notification = this.notificationRepo.create({
      course_id: course.course_id,
      title: dto.title,
      content: dto.content,
    });

    const saved = await this.notificationRepo.save(notification);

    await this.sendNotification(course);

    return saved;
  }

  private async sendNotification(course: CourseEntity) {
    const enrolled_users = await this.enrollCourseService.findEnrolledUsers(
      course.course_id,
    );
    const built_notification =
      this.notificationBuilder.courseAnnouncement(course);
    for (const user of enrolled_users) {
      const notification = await this.notificationService.save(
        user.user_id,
        NotificationType.COURSE_UPDATED,
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

  async findFromCourse(course_id: Nanoid, query: PageOffsetOptionsDto) {
    const query_builder = this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.course', 'course')
      .where('course.id = :course_id', { course_id });

    const [notifications, metaDto] = await paginate<CourseNotificationEntity>(
      query_builder,
      query,
      {
        skipCount: false,
        takeAll: false,
      },
    );

    return new OffsetPaginatedDto(notifications, metaDto);
  }

  async delete(id: Nanoid) {
    return this.notificationRepo.delete(id);
  }
}
