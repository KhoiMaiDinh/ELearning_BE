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

export {
  CommentMetadata,
  CouponMetadata,
  CourseMetadata,
  LectureMetadata,
  PayoutMetadata,
  ReasonMetadata,
  UserMetadata,
};
