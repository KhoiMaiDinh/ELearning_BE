import {
  ReplyMetadata,
  ThreadMetadata,
} from '@/api/ban/interface/warning-metadata.interface';
import { NotificationType } from '../enum/notification-type.enum';
import {
  CommentMetadata,
  CouponMetadata,
  CourseMetadata,
  LectureMetadata,
  PayoutBatchMetadata,
  PayoutMetadata,
  ReasonMetadata,
  UserMetadata,
} from './metadata.interface';

export type NotificationMetadataMap = {
  [NotificationType.INSTRUCTOR_REGISTERED]: UserMetadata;
  [NotificationType.COURSE_ENROLLED]: CourseMetadata;
  [NotificationType.COURSE_COMPLETED]: CourseMetadata;
  [NotificationType.NEW_LECTURE_ADDED]: LectureMetadata;
  [NotificationType.COURSE_UPDATED]: CourseMetadata;
  [NotificationType.COURSE_UNBANNED]: CourseMetadata;
  [NotificationType.COUPON_FOR_COURSE]: CouponMetadata;
  [NotificationType.COUPON_FOR_ALL]: CouponMetadata;
  [NotificationType.NEW_REPLY]: CourseMetadata &
    LectureMetadata &
    ThreadMetadata &
    ReplyMetadata;

  // Instructors
  [NotificationType.NEW_ENROLLMENT]: CourseMetadata & UserMetadata;
  [NotificationType.COURSE_REVIEW_RECEIVED]: CourseMetadata & UserMetadata;
  [NotificationType.COURSE_APPROVED]: CourseMetadata;
  [NotificationType.COURSE_REJECTED]: CourseMetadata & ReasonMetadata;
  [NotificationType.PAYOUT_PROCESSED]: PayoutMetadata;
  [NotificationType.PROFILE_APPROVED]: UserMetadata;
  [NotificationType.PROFILE_REJECTED]: UserMetadata & ReasonMetadata;
  [NotificationType.UNBAN_APPROVED]: CourseMetadata;
  [NotificationType.UNBAN_REJECTED]: CourseMetadata;
  [NotificationType.NEW_THREAD]: CourseMetadata &
    LectureMetadata &
    ThreadMetadata;
  [NotificationType.NEW_REPLY]: CourseMetadata &
    LectureMetadata &
    ThreadMetadata &
    ReplyMetadata;
  [NotificationType.NEW_COMMENT]: CommentMetadata &
    CourseMetadata &
    LectureMetadata;
  [NotificationType.INSTRUCTOR_APPROVAL_REQUEST]: UserMetadata;
  [NotificationType.UNBAN_REQUEST]: CourseMetadata;
  [NotificationType.PAYOUT_GENERATED]: PayoutBatchMetadata;
};
