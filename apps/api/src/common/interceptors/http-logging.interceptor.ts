import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const method = request.method;
    const url = request.originalUrl ?? request.url;
    const startedAt = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - startedAt;
        this.logger.log(`← ${method} ${url} ${response.statusCode} ${ms}ms`);
      }),
      catchError((error: unknown) => {
        const ms = Date.now() - startedAt;
        const status =
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          typeof error.status === 'number'
            ? error.status
            : 500;
        this.logger.warn(`← ${method} ${url} ${status} ${ms}ms (error)`);
        return throwError(() => error);
      }),
    );
  }
}
