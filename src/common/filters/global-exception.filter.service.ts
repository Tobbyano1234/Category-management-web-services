import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorResponse = {};

    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      status = exception.getStatus();
      message = exception.message;
      errorResponse = {
        statusCode: status,
        message: message,
        errors: Array.isArray(exceptionResponse['message'])
          ? exceptionResponse['message']
          : [exceptionResponse['message']],
        ...(isDevelopment && {
          stack:
            exception instanceof Error
              ? exception.stack
              : 'No stack trace available',
        }),
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      errorResponse = {
        statusCode: status,
        message: message,
        ...(isDevelopment && {
          stack:
            exception instanceof Error
              ? exception.stack
              : 'No stack trace available',
        }),
      };
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.handlePrismaError(exception);
      errorResponse = {
        statusCode: status,
        message: message,
        ...(isDevelopment && {
          stack:
            exception instanceof Error
              ? exception.stack
              : 'No stack trace available',
        }),
      };
    } else {
      errorResponse = {
        statusCode: status,
        message: message,
        ...(isDevelopment && {
          stack:
            exception instanceof Error
              ? exception.stack
              : 'No stack trace available',
        }),
      };
    }

    // Log the error
    this.logger.error(`${request.method} ${request.url}`, exception);
    // Log the error
    console.error('Exception caught:', errorResponse);

    response.status(status).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    switch (error.code) {
      case 'P2002':
        return 'A unique constraint would be violated on this operation.';
      case 'P2025':
        return 'Record to update not found.';
      default:
        return `Database error: ${error.message}`;
    }
  }
}
