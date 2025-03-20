import {
  UPLOAD_TYPE_RESOURCE,
  UploadEntityProperty,
  UploadResource,
} from '@/constants';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export const VALID_EXTENSIONS: Record<UploadResource, string[]> = {
  [UploadResource.VIDEO]: ['mp4', 'mov', 'avi', 'mkv'],
  [UploadResource.IMAGE]: ['jpg', 'jpeg', 'png', 'gif'],
  [UploadResource.PDF]: ['pdf'],
};

@ValidatorConstraint({ name: 'isValidMediaFile', async: false })
export class IsValidMediaFileConstraint
  implements ValidatorConstraintInterface
{
  validate(filename: string, args: ValidationArguments) {
    const object = args.object as Record<string, any>;
    const uploadType = object[args.constraints[0]] as UploadEntityProperty;
    if (!uploadType) {
      return false;
    }

    const validExtensions = VALID_EXTENSIONS[UPLOAD_TYPE_RESOURCE[uploadType]];
    if (!validExtensions) {
      return false;
    }

    return validExtensions.some((ext) =>
      filename.toLowerCase().endsWith(`.${ext}`),
    );
  }

  defaultMessage(args: ValidationArguments) {
    const uploadType = args.object[args.constraints[0]] as UploadEntityProperty;
    console.log(uploadType);
    const resource = UPLOAD_TYPE_RESOURCE[uploadType];

    return `Invalid file type for ${uploadType}. Expected ${resource.toLowerCase()} formats: ${VALID_EXTENSIONS[resource].join(', ')}.`;
  }
}
