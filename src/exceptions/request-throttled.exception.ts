import { ErrorCode } from '@/constants/index';
import { NotAcceptableException as BaseException } from '@nestjs/common';

/**
 * RequestThrottledException used to throw forbidden errors with a custom error code and message.
 * ErrorCode default is V000 (Common Validation)
 */
export class RequestThrottledException extends BaseException {
  constructor(
    error: ErrorCode = ErrorCode.V000,
    message?: string,
    validAt?: Date,
  ) {
    super({ errorCode: error, message, validAt });
  }
}
