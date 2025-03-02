import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function EnsureLanguages(
  requiredLanguages: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      propertyName: propertyName,
      name: 'ensureLanguages',
      target: object.constructor,
      constraints: [requiredLanguages],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) return false;

          const languages = value.map((t) => t.language);
          return requiredLanguages.every((lang) => languages.includes(lang));
        },
        defaultMessage(args: ValidationArguments) {
          const requiredLangs = args.constraints[0].join(' and ');
          return `Translations must include ${requiredLangs}`;
        },
      },
    });
  };
}
