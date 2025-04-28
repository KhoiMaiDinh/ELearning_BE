import { NotificationType } from '../enum/notification-type.enum';
import {
  CommentMetadata,
  CouponMetadata,
  CourseMetadata,
  LectureMetadata,
  PayoutMetadata,
  ReasonMetadata,
  UserMetadata,
} from './metadata.interface';

export type NotificationMetadataMap = {
  [NotificationType.COURSE_ENROLLED]: CourseMetadata;
  [NotificationType.COURSE_COMPLETED]: CourseMetadata;
  [NotificationType.NEW_LECTURE_ADDED]: LectureMetadata;
  [NotificationType.COURSE_UPDATED]: CourseMetadata;
  [NotificationType.COURSE_DISCOUNT_AVAILABLE]: CourseMetadata & CouponMetadata;

  // Instructors
  [NotificationType.NEW_ENROLLMENT]: CourseMetadata & UserMetadata;
  [NotificationType.COURSE_REVIEW_RECEIVED]: CourseMetadata & UserMetadata;
  [NotificationType.COURSE_APPROVED]: CourseMetadata;
  [NotificationType.COURSE_REJECTED]: CourseMetadata & ReasonMetadata;
  [NotificationType.PAYOUT_PROCESSED]: PayoutMetadata;

  [NotificationType.NEW_COMMENT]: CommentMetadata;
  //   [NotificationType.ADMIN_MESSAGE]: AdminMessageMetadata;
};
