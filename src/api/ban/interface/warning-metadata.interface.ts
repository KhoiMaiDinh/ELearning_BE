import { Nanoid } from '@/common';

interface CourseMetadata {
  course_id: string;
}

interface UserMetadata {
  user_id: string;
}

interface LectureMetadata {
  lecture_id: string;
}

interface ThreadMetadata {
  thread_id: Nanoid;
}

interface ReplyMetadata {
  reply_id: Nanoid;
}

interface ViolatedContentMetadata {
  contents?: string[];
}

export {
  CourseMetadata,
  LectureMetadata,
  ReplyMetadata,
  ThreadMetadata,
  UserMetadata,
  ViolatedContentMetadata,
};
