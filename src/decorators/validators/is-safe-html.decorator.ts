import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import sanitizeHtml from 'sanitize-html';

@ValidatorConstraint({ name: 'isSafeHtml', async: false })
export class IsSafeHtmlConstraint implements ValidatorConstraintInterface {
  validate(html: string | string[], args: ValidationArguments) {
    if (Array.isArray(html)) {
      return html.every((html) => html === sanitizeHtml(html)); // ✅ Handle arrays
    }
    return html === sanitizeHtml(html);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid or unsafe HTML content!';
  }
}

export function IsSafeHtml(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSafeHtmlConstraint,
    });
  };
}
