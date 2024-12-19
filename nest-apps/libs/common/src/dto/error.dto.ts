import { ErrorDetailDto } from './error-detail.dto';

export class ErrorDto {
  timestamp: string;
  error: string;
  errorCode?: number;
  message: string;
  details?: ErrorDetailDto[];
  stack?: string;
  trace?: Error | unknown;
}
