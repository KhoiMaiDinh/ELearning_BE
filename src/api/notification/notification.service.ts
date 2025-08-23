import { CursorPaginationDto, Nanoid, Uuid } from '@/common';
import { ErrorCode, Language } from '@/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CouponRepository } from '@/api/coupon/coupon.repository';
import { LectureRepository } from '@/api/course-item/lecture/repositories/lecture.repository';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { LectureCommentRepository } from '@/api/lecture-comment/repositories/lecture-comment.repository';
import { PayoutRepository } from '@/api/payment/repositories/payout.repository';
import { UserRepository } from '@/api/user/user.repository';

import { NotificationEntity } from '@/api/notification/entities/notification.entity';
import { NotificationMetadataMap as MetadataMap } from '@/api/notification/interfaces/metadata-map.type';
import { NotFoundException } from '@/exceptions';
import { buildPaginator } from '@/utils';
import { plainToInstance } from 'class-transformer';
import { ReplyRepository } from '../thread/repositories/reply.repository';
import { ThreadRepository } from '../thread/repositories/thread.repository';
import {
  NotificationPaginationResDto,
  NotificationQuery,
  NotificationRes,
} from './dto';
import { NotificationType } from './enum/notification-type.enum';
import {
  isCertificateMetadata,
  isCommentMetadata,
  isCouponMetadata,
  isCourseMetadata,
  isLectureMetadata,
  isPayoutBatchMetadata,
  isPayoutMetadata,
  isReasonMetadata,
  isReplyMetadata,
  isThreadMetadata,
  isUserMetadata,
} from './interfaces/metadata.interface';
import { NotificationBuilderService } from './notification-builder.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    private readonly userRepo: UserRepository,
    private readonly courseRepo: CourseRepository,
    private readonly commentRepo: LectureCommentRepository,
    private readonly lectureRepo: LectureRepository,
    private readonly couponRepo: CouponRepository,
    private readonly enrolledCourseRepo: EnrolledCourseRepository,
    private readonly payoutRepo: PayoutRepository,
    private readonly threadRepo: ThreadRepository,
    private readonly replyRepo: ReplyRepository,

    private readonly notiBuilderService: NotificationBuilderService,
  ) {}

  async saveAndBuild<T extends keyof MetadataMap>(
    user_id: Uuid,
    type: T,
    metadata: MetadataMap[T],
    fallback?: { title: string; body: string },
  ) {
    const notification = await this.save(user_id, type, metadata, fallback);
    return { ...notification, ...this.buildContent(notification, Language.VI) };
  }

  async save<T extends keyof MetadataMap>(
    user_id: Uuid,
    type: T,
    metadata: MetadataMap[T],
    fallback?: { title: string; body: string },
  ) {
    this.validateNotificationMetadata(type, metadata);

    const notification = this.notificationRepo.create({
      user_id,
      type,
      metadata,
      title: fallback?.title,
      body: fallback?.body,
    });
    return await this.notificationRepo.save(notification);
  }

  async getUserNotifications(
    user_id: Nanoid,
    query: NotificationQuery,
  ): Promise<NotificationPaginationResDto> {
    const queryBuilder = this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('user.id = :user_id', { user_id });
    const paginator = buildPaginator({
      entity: NotificationEntity,
      alias: 'notification',
      paginationKeys: ['createdAt'],
      query: {
        limit: query.limit,
        order: 'DESC',
        afterCursor: query.afterCursor,
        beforeCursor: query.beforeCursor,
      },
    });

    const [{ data: notifications, cursor }, unseen_count] = await Promise.all([
      paginator.paginate(queryBuilder),
      this.countUnseen(user_id),
    ]);

    const built_notification = await Promise.all(
      notifications.map(async (notification) => ({
        ...notification,
        ...(await this.buildContent(notification, query.lang)),
      })),
    );

    const metaDto = new CursorPaginationDto(
      notifications.length,
      cursor.afterCursor,
      cursor.beforeCursor,
      query,
    );

    const notification_response = plainToInstance(
      NotificationRes,
      built_notification,
    );

    return new NotificationPaginationResDto(
      notification_response,
      metaDto,
      unseen_count,
    );
  }

  private async countUnseen(user_id: Nanoid) {
    const unseen_count = await this.notificationRepo.count({
      where: {
        user: { id: user_id },
        is_read: false,
      },
    });
    return unseen_count;
  }

  async markAsRead(user_id: Nanoid, notification_id: Nanoid) {
    const notification = await this.notificationRepo.findOne({
      where: { id: notification_id, user: { id: user_id } },
    });
    if (!notification) throw new NotFoundException(ErrorCode.E080);
    notification.is_read = true;
    await this.notificationRepo.save(notification);
  }

  async markAllAsRead(user_id: Nanoid) {
    const notifications = await this.notificationRepo.find({
      where: {
        user: { id: user_id },
        is_read: false,
      },
      relations: {
        user: true,
      },
    });

    if (notifications.length) {
      await this.notificationRepo.save(
        notifications.map((n) => ({
          ...n,
          is_read: true,
        })),
      );
    }
  }

  private async buildContent(notification: NotificationEntity, lang: Language) {
    const fallback = {
      image: '',
      title: notification.title ?? '',
      body: notification.body ?? '',
    };

    const handler = this.notificationHandlers[notification.type];
    if (!handler) {
      return fallback;
    }
    return await handler(notification, lang);
  }

  private validateNotificationMetadata(
    type: NotificationType,
    metadata: any,
  ): void {
    const isValid = (() => {
      switch (type) {
        case NotificationType.INSTRUCTOR_REGISTERED:
          return isUserMetadata(metadata);
        case NotificationType.COURSE_ENROLLED:
          return isCourseMetadata(metadata);
        case NotificationType.COURSE_COMPLETED:
          return isCourseMetadata(metadata) && isCertificateMetadata(metadata);
        case NotificationType.NEW_LECTURE_ADDED:
          return isLectureMetadata(metadata);
        case NotificationType.COURSE_UPDATED:
          return isCourseMetadata(metadata);
        case NotificationType.COURSE_UNBANNED:
          return isCourseMetadata(metadata);
        case NotificationType.COUPON_FOR_ALL:
          return;
        case NotificationType.COUPON_FOR_COURSE:
          return isCouponMetadata(metadata);
        case NotificationType.NEW_REPLY:
          return isReplyMetadata(metadata);
        case NotificationType.COURSE_ANNOUNCEMENT:
          return isCourseMetadata(metadata);

        // instructor
        case NotificationType.PROFILE_APPROVED:
          return isUserMetadata(metadata);
        case NotificationType.COURSE_BANNED:
          return isCourseMetadata(metadata);
        case NotificationType.UNBAN_APPROVED:
          return isCourseMetadata(metadata);
        case NotificationType.UNBAN_REJECTED:
          return isCourseMetadata(metadata);
        case NotificationType.PROFILE_REJECTED:
          return isUserMetadata(metadata) && isReasonMetadata(metadata);
        case NotificationType.COURSE_APPROVED:
          return isCourseMetadata(metadata);
        case NotificationType.PAYOUT_PROCESSED:
          return isPayoutMetadata(metadata);

        case NotificationType.NEW_ENROLLMENT:
          return isCourseMetadata(metadata) && isUserMetadata(metadata);
        case NotificationType.COURSE_REVIEW_RECEIVED:
          return isCourseMetadata(metadata) && isUserMetadata(metadata);

        case NotificationType.COURSE_REJECTED:
          return isCourseMetadata(metadata) && isReasonMetadata(metadata);
        case NotificationType.NEW_THREAD:
          return isThreadMetadata(metadata);
        case NotificationType.NEW_COMMENT:
          return isCommentMetadata(metadata);
        // admin
        case NotificationType.INSTRUCTOR_APPROVAL_REQUEST:
          return isUserMetadata(metadata);
        case NotificationType.UNBAN_REQUEST:
          return isCourseMetadata(metadata);
        case NotificationType.PAYOUT_GENERATED:
          return isPayoutBatchMetadata(metadata);

        default:
          return false;
      }
    })();

    if (!isValid) {
      throw new Error(`Invalid metadata for notification type: ${type}`);
    }
  }

  private notificationHandlers: Record<
    NotificationType,
    (
      notification: NotificationEntity,
      lang: Language,
    ) => Promise<{ title: string; body: string; image: string }>
  > = {
    [NotificationType.INSTRUCTOR_REGISTERED]:
      this.buildInstructorRegisteredContent.bind(this),
    [NotificationType.COURSE_ENROLLED]:
      this.buildCourseEnrolledContent.bind(this),
    [NotificationType.COURSE_COMPLETED]:
      this.buildCourseCompletedContent.bind(this),
    [NotificationType.NEW_LECTURE_ADDED]:
      this.buildNewLectureAddedContent.bind(this),
    [NotificationType.COURSE_UPDATED]:
      this.buildCourseUpdatedContent.bind(this),
    [NotificationType.COURSE_UNBANNED]:
      this.buildCourseUnbannedContent.bind(this),
    [NotificationType.COUPON_FOR_COURSE]:
      this.buildCouponForCourseContent.bind(this),
    [NotificationType.COUPON_FOR_ALL]: this.buildCouponForAllContent.bind(this),
    [NotificationType.NEW_REPLY]: this.buildNewReplyContent.bind(this),
    [NotificationType.COURSE_ANNOUNCEMENT]:
      this.buildCourseAnnouncementContent.bind(this),
    // To instructor
    [NotificationType.NEW_ENROLLMENT]:
      this.buildNewEnrollmentContent.bind(this),
    [NotificationType.COURSE_REVIEW_RECEIVED]:
      this.buildCourseReviewReceivedContent.bind(this),
    [NotificationType.COURSE_APPROVED]:
      this.buildCourseApprovedContent.bind(this),
    [NotificationType.PAYOUT_PROCESSED]:
      this.buildPayoutProcessedContent.bind(this),
    [NotificationType.COURSE_REJECTED]:
      this.buildCourseRejectedContent.bind(this),
    [NotificationType.NEW_COMMENT]: this.buildNewCommentContent.bind(this),
    [NotificationType.PROFILE_APPROVED]:
      this.buildInstructorApprovedContent.bind(this),
    [NotificationType.PROFILE_REJECTED]:
      this.buildInstructorRejectedContent.bind(this),
    [NotificationType.COURSE_BANNED]: this.buildCourseBannedContent.bind(this),
    [NotificationType.UNBAN_APPROVED]:
      this.buildUnbanApprovedContent.bind(this),
    [NotificationType.UNBAN_REJECTED]:
      this.buildUnbanRejectedContent.bind(this),
    [NotificationType.NEW_THREAD]: this.buildNewThreadContent.bind(this),
    // To admin
    [NotificationType.INSTRUCTOR_APPROVAL_REQUEST]:
      this.buildInstructorApprovalRequestContent.bind(this),
    [NotificationType.UNBAN_REQUEST]: this.buildUnbanRequestContent.bind(this),
    [NotificationType.PAYOUT_GENERATED]:
      this.buildPayoutGeneratedContent.bind(this),
  };

  private async buildCourseAnnouncementContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_ANNOUNCEMENT];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
      relations: {
        instructor: true,
      },
    });
    if (!course) throw new NotFoundException(ErrorCode.E080);
    return this.notiBuilderService.courseAnnouncement(course, lang);
  }

  private async buildNewThreadContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.NEW_THREAD];
    const thread = await this.threadRepo.findOne({
      where: { id: metadata.thread_id },
      relations: {
        author: true,
        lecture: { series: true },
      },
    });
    if (!thread) throw new NotFoundException(ErrorCode.E080);
    return this.notiBuilderService.newThread(thread, lang);
  }

  private async buildNewReplyContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.NEW_REPLY];
    const reply = await this.replyRepo.findOne({
      where: { id: metadata.reply_id },
      relations: {
        author: true,
        thread: { lecture: true },
      },
    });
    if (!reply) throw new NotFoundException(ErrorCode.E080);
    return this.notiBuilderService.newReply(reply, lang);
  }

  private async buildCourseBannedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_BANNED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.courseBanned(course, lang);
  }

  private async buildUnbanApprovedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.UNBAN_APPROVED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.unbanApproved(course, lang);
  }

  private async buildUnbanRejectedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.UNBAN_REJECTED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.unbanRejected(course, lang);
  }

  private async buildCourseUnbannedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_UNBANNED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.courseUnbanned(course, lang);
  }

  private async buildPayoutGeneratedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.PAYOUT_GENERATED];

    return this.notiBuilderService.payoutGenerated(metadata, lang);
  }

  private async buildInstructorRegisteredContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.INSTRUCTOR_APPROVAL_REQUEST];
    const user = await this.userRepo.findOne({
      where: { id: metadata.user_id },
    });
    return this.notiBuilderService.instructorRegistered(user, lang);
  }

  private async buildCourseEnrolledContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_ENROLLED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.courseEnrolled(course, lang);
  }

  private async buildNewCommentContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.NEW_COMMENT];
    const comment = await this.commentRepo.findOne({
      where: { id: metadata.comment_id },
      relations: {
        lecture: { section: { course: true }, series: true },
        user: {
          profile_image: true,
        },
      },
    });

    return this.notiBuilderService.newCommentContent(comment, lang);
  }

  private async buildCourseCompletedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_COMPLETED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.courseCompleted(course, lang);
  }

  private async buildNewLectureAddedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.NEW_LECTURE_ADDED];
    const lecture = await this.lectureRepo.findOne({
      where: { id: metadata.lecture_id },
      relations: { section: { course: true } },
    });

    return this.notiBuilderService.newLectureAdded(lecture, lang);
  }

  private async buildCourseUpdatedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_UPDATED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.courseUpdated(course, lang);
  }

  private async buildCouponForCourseContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COUPON_FOR_COURSE];

    const coupon = await this.couponRepo.findOne({
      where: { code: metadata.coupon_code },
      relations: {
        course: true,
      },
    });
    return this.notiBuilderService.couponForCourse(coupon, lang);
  }

  private async buildCouponForAllContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COUPON_FOR_ALL];
    const coupon = await this.couponRepo.findOne({
      where: { code: metadata.coupon_code },
    });
    return this.notiBuilderService.couponForAll(coupon, lang);
  }

  private async buildUnbanRequestContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.UNBAN_REQUEST];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
      relations: {
        thumbnail: true,
        warnings: {
          report: true,
        },
        unban_requests: true,
      },
    });
    return this.notiBuilderService.unbanRequest(course, lang);
  }

  private async buildNewEnrollmentContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.NEW_ENROLLMENT];
    const enrolled_course = await this.enrolledCourseRepo.findOne({
      where: {
        course: { id: metadata.course_id },
        user: { id: metadata.user_id },
      },
      relations: { course: true, user: true },
    });
    return this.notiBuilderService.newEnrollment(enrolled_course, lang);
  }

  private async buildCourseReviewReceivedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_REVIEW_RECEIVED];
    const enrolled_course = await this.enrolledCourseRepo.findOne({
      where: {
        course: { id: metadata.course_id },
        user: { id: metadata.user_id },
      },
      relations: { course: true, user: true },
    });
    return this.notiBuilderService.courseReviewReceived(enrolled_course, lang);
  }

  private async buildCourseApprovedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_APPROVED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.courseApproved(course, lang);
  }

  private async buildCourseRejectedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_REJECTED];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });
    return this.notiBuilderService.courseRejected(
      course,
      metadata.reason,
      lang,
    );
  }

  private async buildPayoutProcessedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.PAYOUT_PROCESSED];
    const payout = await this.payoutRepo.findOne({
      where: { id: metadata.payout_id },
    });
    return this.notiBuilderService.payoutProcessed(payout, lang);
  }

  private async buildInstructorApprovalRequestContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.INSTRUCTOR_APPROVAL_REQUEST];
    const user = await this.userRepo.findOne({
      where: { id: metadata.user_id },
    });
    return this.notiBuilderService.instructorApprovalRequest(user, lang);
  }

  private async buildInstructorApprovedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    return this.notiBuilderService.instructorApproved(lang);
  }

  private async buildInstructorRejectedContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.PROFILE_REJECTED];
    return this.notiBuilderService.instructorRejected(metadata.reason, lang);
  }
}
