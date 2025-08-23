import { customAlphabet } from 'nanoid';
import { BeforeUpdate } from 'typeorm';

const readableAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Decorator to auto-generate a readable coupon-like ID before update.
 * Only applies if `is_completed` is true and field is empty.
 *
 * @param options.prefix Optional prefix (e.g., 'CERT')
 * @param options.length Length of the suffix (default: 6)
 */
export function AutoCertificateCode(options?: {
  prefix?: string;
  length?: number;
}) {
  const length = options?.length || 6;
  const prefix = options?.prefix?.toUpperCase() || '';

  return function (target: any, propertyKey: string) {
    if (!target.constructor._couponCodeFields) {
      target.constructor._couponCodeFields = [];
    }

    target.constructor._couponCodeFields.push({ propertyKey, prefix, length });

    if (!target.constructor._hasBeforeUpdateCouponHook) {
      target.constructor._hasBeforeUpdateCouponHook = true;

      BeforeUpdate()(target, 'generateCouponCodes');

      target.generateCouponCodes = function () {
        const generator = customAlphabet(readableAlphabet, length);

        target.constructor._couponCodeFields.forEach(
          (field: { propertyKey: string; prefix: string; length: number }) => {
            const shouldGenerate =
              typeof this.is_completed === 'boolean'
                ? this.is_completed
                : false;

            if (!this[field.propertyKey] && shouldGenerate) {
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
