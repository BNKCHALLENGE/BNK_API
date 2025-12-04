import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  success: false;
  error: {
    code: string | number;
    message: string;
  };
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | string
      | { message?: string | string[]; error?: string; statusCode?: number; code?: string | number };

    const code =
      (typeof exceptionResponse === 'object' &&
        (exceptionResponse.code || exceptionResponse.error || exceptionResponse.statusCode)) ||
      status;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message.join(', ')
        : exceptionResponse.message || exception.message;

    const errorBody: ErrorResponse = {
      success: false,
      error: {
        code: typeof code === 'number' ? HttpStatus[code] || code : code,
        message,
      },
    };

    response.status(status).json(errorBody);
  }
}
