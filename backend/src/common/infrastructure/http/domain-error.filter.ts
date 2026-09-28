import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { ConflictError } from '../../domain/errors/conflict.error.js';
import { DomainError } from '../../domain/errors/domain.error.js';
import { ForbiddenError } from '../../domain/errors/forbidden.error.js';
import { NotFoundError } from '../../domain/errors/not-found.error.js';
import { TooManyRequestsError } from '../../domain/errors/too-many-requests.error.js';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error.js';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const status =
      error instanceof NotFoundError
        ? HttpStatus.NOT_FOUND
        : error instanceof ConflictError
          ? HttpStatus.CONFLICT
          : error instanceof UnauthorizedError
            ? HttpStatus.UNAUTHORIZED
            : error instanceof ForbiddenError
              ? HttpStatus.FORBIDDEN
              : error instanceof TooManyRequestsError
                ? HttpStatus.TOO_MANY_REQUESTS
                : HttpStatus.BAD_REQUEST;
    host.switchToHttp().getResponse<Response>().status(status).json({ statusCode: status, message: error.message });
  }
}
