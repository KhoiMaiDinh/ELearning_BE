import { Nanoid } from '@/common';
import { Language } from '@/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CouponRepository } from '@/api/coupon/coupon.repository';
import { LectureRepository } from '@/api/course-item/lecture/lecture.repository';
import { CourseRepository } from '@/api/course/repositories/course.repository';
import { EnrolledCourseRepository } from '@/api/course/repositories/enrolled-course.repository';
import { LectureCommentRepository } from '@/api/lecture-comment/lecture-comment.repository';
import { PayoutRepository } from '@/api/payment/repositories/payout.repository';
import { UserRepository } from '@/api/user/user.repository';

import { NotificationEntity } from '@/api/notification/entities/notification.entity';
import { NotificationMetadataMap as MetadataMap } from '@/api/notification/interfaces/metadata-map.type';
import { NotificationType } from './enum/notification-type.enum';
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

    private readonly notiBuilderService: NotificationBuilderService,
  ) {}

  async save<T extends keyof MetadataMap>(
    user_id: string,
    type: T,
    metadata: MetadataMap[T],
    fallback?: { title: string; body: string },
  ) {
    const notification = this.notificationRepo.create({
      user_id,
      type,
      metadata,
      title: fallback?.title,
      body: fallback?.body,
    });
    await this.notificationRepo.save(notification);
  }

  async getUserNotifications(user_id: Nanoid, language: Language) {
    const notifications = await this.notificationRepo.find({
      where: { user: { id: user_id } },
      order: { createdAt: 'DESC' },
      relations: { user: true },
    });

    return notifications.map((notification) => {
      return {
        ...notification,
        ...this.buildContent(notification, language),
      };
    });
  }

  private buildContent(notification: NotificationEntity, lang: Language) {
    const fallback = {
      title: notification.title ?? '',
      body: notification.body ?? '',
    };

    const handler = this.notificationHandlers[notification.type];
    if (!handler) {
      return fallback;
    }
    return handler(notification, lang);
  }

  private notificationHandlers: Record<
    NotificationType,
    (
      notification: NotificationEntity,
      lang: Language,
    ) => { title: string; body: string }
  > = {
    [NotificationType.COURSE_ENROLLED]:
      this.buildCourseEnrolledContent.bind(this),
    [NotificationType.COURSE_COMPLETED]:
      this.buildCourseCompletedContent.bind(this),
    [NotificationType.NEW_LECTURE_ADDED]:
      this.buildNewLectureAddedContent.bind(this),
    [NotificationType.COURSE_UPDATED]:
      this.buildCourseUpdatedContent.bind(this),
    [NotificationType.COURSE_DISCOUNT_AVAILABLE]:
      this.buildCourseDiscountAvailableContent.bind(this),
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
  };

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
      relations: { lecture: true },
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

  private async buildCourseDiscountAvailableContent(
    notification: NotificationEntity,
    lang: Language,
  ) {
    const metadata =
      notification.metadata as MetadataMap[NotificationType.COURSE_DISCOUNT_AVAILABLE];
    const course = await this.courseRepo.findOne({
      where: { id: metadata.course_id },
    });

    const coupon = await this.couponRepo.findOne({
      where: { code: metadata.coupon_code },
    });
    return this.notiBuilderService.courseDiscountAvailable(
      course,
      coupon,
      lang,
    );
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
}
