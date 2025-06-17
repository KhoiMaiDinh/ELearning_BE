import { Nanoid } from '@/common';

interface CourseMetadata {
  course_id: Nanoid;
}

interface LectureMetadata {
  lecture_id: Nanoid;
}

interface CouponMetadata {
  coupon_code: Nanoid;
}

interface UserMetadata {
  user_id: Nanoid;
  username: string;
}

interface CommentMetadata {
  comment_id: Nanoid;
}

interface ReasonMetadata {
  reason: string;
}

interface PayoutMetadata {
  payout_id: Nanoid;
}

interface PayoutBatchMetadata {
  month: number;
  year: number;
}

function isCourseMetadata(data: any): data is CourseMetadata {
  return typeof data?.course_id === 'string';
}

function isLectureMetadata(data: any): data is LectureMetadata {
  return typeof data?.lecture_id === 'string';
}

function isCouponMetadata(data: any): data is CouponMetadata {
  return typeof data?.coupon_code === 'string';
}

function isUserMetadata(data: any): data is UserMetadata {
  return (
    typeof data?.user_id === 'string' && typeof data?.username === 'string'
  );
}

function isCommentMetadata(data: any): data is CommentMetadata {
  return typeof data?.comment_id === 'string';
}

function isReasonMetadata(data: any): data is ReasonMetadata {
  return typeof data?.reason === 'string';
}

function isPayoutMetadata(data: any): data is PayoutMetadata {
  return typeof data?.payout_id === 'string';
}

function isPayoutBatchMetadata(data: any): data is PayoutBatchMetadata {
  return typeof data?.month === 'number' && typeof data?.year === 'number';
}

export {
  CommentMetadata,
  CouponMetadata,
  CourseMetadata,
  isCommentMetadata,
  isCouponMetadata,
  isCourseMetadata,
  isLectureMetadata,
  isPayoutBatchMetadata,
  isPayoutMetadata,
  isReasonMetadata,
  isUserMetadata,
  LectureMetadata,
  PayoutBatchMetadata,
  PayoutMetadata,
  ReasonMetadata,
  UserMetadata,
};
