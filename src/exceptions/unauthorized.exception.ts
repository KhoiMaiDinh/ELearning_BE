import { ErrorCode } from '@/constants';
import { UnauthorizedException as BaseException } from '@nestjs/common';

/**
 * UnauthorizedException used to throw authorization errors with a custom error code and message.
 * ErrorCode default is V000 (Common Validation)
 */
export class UnauthorizedException extends BaseException {
  constructor(error: ErrorCode = ErrorCode.V000, message?: string) {
    super({ errorCode: error, message });
  }
}
