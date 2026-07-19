import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { API_ERROR_CODES } from '@gymhub/shared';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const payload =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : (exceptionResponse as Record<string, unknown>);

      response.status(status).json({
        statusCode: status,
        code: (payload.code as string) ?? mapStatusToCode(status),
        message: payload.message ?? exception.message,
        details: payload.details ?? payload.errors ?? undefined,
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
}

function mapStatusToCode(status: number): string {
  if (status === 401) return API_ERROR_CODES.UNAUTHORIZED;
  if (status === 403) return API_ERROR_CODES.FORBIDDEN;
  if (status === 404) return API_ERROR_CODES.NOT_FOUND;
  if (status === 409) return API_ERROR_CODES.CONFLICT;
  if (status === 400) return API_ERROR_CODES.VALIDATION_ERROR;
  return 'ERROR';
}
