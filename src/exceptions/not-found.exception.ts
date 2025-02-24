import { ErrorCode } from '@/constants';
import { NotFoundException as BaseException } from '@nestjs/common';

/**
 * UnauthorizedException used to throw not found errors with a custom error code and message.
 * ErrorCode default is V000 (Common Validation)
 */
export class NotFoundException extends BaseException {
  constructor(error: ErrorCode = ErrorCode.V000, message?: string) {
    super({ errorCode: error, message });
  }
}
