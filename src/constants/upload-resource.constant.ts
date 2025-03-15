import { Entity } from './entity.constant';

export enum UploadResource {
  VIDEO = 'video',
  IMAGE = 'image',
  PDF = 'pdf',
}

export enum Bucket {
  IMAGE = 'image',
  VIDEO = 'video',
  TEMP_VIDEO = 'temp-video',
}

export enum UploadStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  DELETED = 'deleted',
}

export enum UploadEntityProperty {
  AVATAR = 'avatar',
  PROFILE_IMAGE = 'profile-image',
  COURSE_THUMBNAIL = 'course-thumbnail',
  LESSON_VIDEO = 'lesson-video',
  LESSON_PDF = 'lesson-pdf',
}

export const VALID_UPLOAD_TYPES: Record<Entity, UploadEntityProperty[]> = {
  user: [UploadEntityProperty.AVATAR, UploadEntityProperty.PROFILE_IMAGE],
  course: [UploadEntityProperty.COURSE_THUMBNAIL],
  lesson: [UploadEntityProperty.LESSON_VIDEO, UploadEntityProperty.LESSON_PDF],
  instructor: [],
  category: [],
  post: [],
  media: [],
  preference: [],
  permission: [],
  role: [],
  'enrolled-course': [],
  'category-translation': [],
};

export const UPLOAD_TYPE_RESOURCE: Record<
  UploadEntityProperty,
  UploadResource
> = {
  [UploadEntityProperty.AVATAR]: UploadResource.IMAGE,
  [UploadEntityProperty.PROFILE_IMAGE]: UploadResource.IMAGE,
  [UploadEntityProperty.COURSE_THUMBNAIL]: UploadResource.IMAGE,
  [UploadEntityProperty.LESSON_VIDEO]: UploadResource.VIDEO,
  [UploadEntityProperty.LESSON_PDF]: UploadResource.PDF,
};
