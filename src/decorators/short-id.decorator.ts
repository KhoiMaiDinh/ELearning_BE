import { nanoid } from 'nanoid';
import { BeforeInsert } from 'typeorm';

/**
 * Decorator to automatically generate a nanoid before inserting an entity.
 *
 * @param length Length of the nanoid (default is 21).
 */
export function AutoNanoId(length = 21) {
  return function (target: any, propertyKey: string) {
    // Store metadata for fields requiring nanoid generation
    if (!target.constructor._nanoidFields) {
      target.constructor._nanoidFields = [];
    }

    target.constructor._nanoidFields.push({ propertyKey, length });

    // Ensure @BeforeInsert hook is present
    if (!target.constructor._hasBeforeInsertHook) {
      target.constructor._hasBeforeInsertHook = true;

      BeforeInsert()(target, 'generateNanoIds');

      target.generateNanoIds = function () {
        target.constructor._nanoidFields.forEach(
          (field: { propertyKey: string; length: number }) => {
            if (!this[field.propertyKey]) {
              this[field.propertyKey] = nanoid(field.length);
            }
          },
        );
      };
    }
  };
}
