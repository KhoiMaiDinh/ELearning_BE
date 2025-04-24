import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AfterDateField(
  property: string,
  offsetDays: number = 0,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'afterDateField',
      target: object.constructor,
      propertyName,
      constraints: [property, offsetDays],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, offset] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!(value instanceof Date) || !(relatedValue instanceof Date)) {
            return false;
          }

          const comparisonDate = new Date(relatedValue);
          comparisonDate.setDate(comparisonDate.getDate() + offset);

          return value > comparisonDate;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedField, offset] = args.constraints;
          if (offset > 0) {
            return `${args.property} must be at least ${offset} day(s) after ${relatedField}`;
          } else {
            return `${args.property} must be after ${relatedField}`;
          }
        },
      },
    });
  };
}
