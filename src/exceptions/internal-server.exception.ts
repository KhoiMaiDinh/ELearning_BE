import { ErrorCode } from '@/constants';
import { ForbiddenException as BaseException } from '@nestjs/common';

/**
 * InternalServerException used to throw forbidden errors with a custom error code and message.
 * ErrorCode default is V000 (Common Validation)
 */
export class InternalServerException extends BaseException {
  constructor(error: ErrorCode = ErrorCode.V000, message?: string) {
    super({ errorCode: error, message });
  }
}
