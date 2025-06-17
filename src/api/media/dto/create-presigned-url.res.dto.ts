import { ENTITY, UploadEntityProperty } from '@/constants';
import {
  EnumField,
  IsValidMediaFileConstraint,
  IsValidUploadType,
  StringField,
} from '@/decorators';
import { isNotEmpty, Validate, ValidateIf } from 'class-validator';

export class CreatePresignedUrlReq {
  @EnumField(() => UploadEntityProperty, { required: true })
  @ValidateIf((o) => isNotEmpty(o.entity))
  @Validate(IsValidUploadType, ['entity'])
  entity_property: UploadEntityProperty;

  @StringField()
  @ValidateIf((o) => isNotEmpty(o.entity_property))
  @Validate(IsValidMediaFileConstraint, ['entity_property'])
  filename: string;

  @EnumField(() => ENTITY)
  entity: ENTITY;
}
