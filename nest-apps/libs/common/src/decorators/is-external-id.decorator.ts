import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({
  async: false,
})
export class IsExternalIdConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    return (
      typeof value === 'string' && value.length === 8 && /^[0-9]+$/.test(value)
    );
  }
  defaultMessage() {
    return `External ID must be a string of eight numeric characters`;
  }
}

export function IsExternalId(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExternalIdConstraint,
    });
  };
}
