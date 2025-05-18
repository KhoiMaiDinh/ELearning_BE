import { ENTITY, UploadEntityProperty, VALID_UPLOAD_TYPES } from '@/constants';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidUploadType', async: false })
export class IsValidUploadType implements ValidatorConstraintInterface {
  validate(uploadType: UploadEntityProperty, args: ValidationArguments) {
    const entityType = (args.object as { entityType: ENTITY })[
      args.constraints[0]
    ];

    if (!VALID_UPLOAD_TYPES[entityType]) {
      return false; // entityType is not recognized
    }

    return VALID_UPLOAD_TYPES[entityType].includes(uploadType); // Check if uploadType is allowed
  }

  defaultMessage(args: ValidationArguments) {
    const entityType = (args.object as { entityType: ENTITY })[
      args.constraints[0]
    ];
    return `Upload type '${args.value}' is not allowed for entity type '${entityType}'.`;
  }
}
