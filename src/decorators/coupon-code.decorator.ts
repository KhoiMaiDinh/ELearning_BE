import { customAlphabet } from 'nanoid';
import { BeforeInsert } from 'typeorm';

const readableAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Decorator to auto-generate a readable coupon-like ID.
 * @param options.prefix Optional prefix (e.g., 'SPRING25')
 * @param options.length Length of the suffix (default: 6)
 */
export function AutoCouponCode(options?: { prefix?: string; length?: number }) {
  const length = options?.length || 6;
  const prefix = options?.prefix?.toUpperCase() || '';

  return function (target: any, propertyKey: string) {
    if (!target.constructor._couponCodeFields) {
      target.constructor._couponCodeFields = [];
    }

    target.constructor._couponCodeFields.push({ propertyKey, prefix, length });

    if (!target.constructor._hasBeforeInsertCouponHook) {
      target.constructor._hasBeforeInsertCouponHook = true;

      BeforeInsert()(target, 'generateCouponCodes');

      target.generateCouponCodes = function () {
        const generator = customAlphabet(readableAlphabet, length);

        target.constructor._couponCodeFields.forEach(
          (field: { propertyKey: string; prefix: string; length: number }) => {
            if (!this[field.propertyKey]) {
              const suffix = generator();
              this[field.propertyKey] = field.prefix
                ? `${field.prefix}-${suffix}`
                : suffix;
            }
          },
        );
      };
    }
  };
}
