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
  DOCUMENT = 'document',
}

export enum UploadStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
  DELETED = 'deleted',
}

export enum UploadEntityProperty {
  PROFILE_IMAGE = 'profile_image',
  THUMBNAIL = 'thumbnail',
  VIDEO = 'video',
  LESSON_PDF = 'lesson_pdf',
  RESUME = 'resume',
  CERTIFICATE_FILE = 'certificate_file',
  RESOURCE_FILE = 'resource_file',
}

export const VALID_UPLOAD_TYPES: Record<Entity, UploadEntityProperty[]> = {
  user: [UploadEntityProperty.PROFILE_IMAGE],
  instructor: [UploadEntityProperty.RESUME],
  course: [UploadEntityProperty.THUMBNAIL],
  lecture: [],
  certificate: [UploadEntityProperty.CERTIFICATE_FILE],
  'lecture-video': [UploadEntityProperty.VIDEO],
  resource: [UploadEntityProperty.RESOURCE_FILE],
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
  [UploadEntityProperty.PROFILE_IMAGE]: UploadResource.IMAGE,
  [UploadEntityProperty.THUMBNAIL]: UploadResource.IMAGE,
  [UploadEntityProperty.VIDEO]: UploadResource.VIDEO,
  [UploadEntityProperty.LESSON_PDF]: UploadResource.PDF,
  [UploadEntityProperty.RESUME]: UploadResource.PDF,
  [UploadEntityProperty.CERTIFICATE_FILE]: UploadResource.PDF,
  [UploadEntityProperty.RESOURCE_FILE]: UploadResource.PDF,
};
