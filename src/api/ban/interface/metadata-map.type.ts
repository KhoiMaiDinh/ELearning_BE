import { WarningType } from '../enum/warning-type.enum';
import {
  CourseMetadata,
  LectureMetadata,
  ReplyMetadata,
  ThreadMetadata,
  ViolatedContentMetadata,
} from './warning-metadata.interface';

export type WarningMetadataMap = {
  [WarningType.COURSE]: CourseMetadata & ViolatedContentMetadata;
  [WarningType.COURSE_ITEM]: LectureMetadata & ViolatedContentMetadata;
  [WarningType.THREAD]: ThreadMetadata & ViolatedContentMetadata;
  [WarningType.REPLY]: ReplyMetadata & ViolatedContentMetadata;
};
