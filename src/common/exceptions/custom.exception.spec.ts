import { CustomException } from './custom.exception';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CustomException', () => {
  it('should create an instance with custom message and status code', () => {
    const message = 'Test error message';
    const statusCode = HttpStatus.BAD_REQUEST;
    const exception = new CustomException(message, statusCode);

    expect(exception).toBeDefined();
    expect(exception).toBeInstanceOf(CustomException);
    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.message).toBe(message);
    expect(exception.getStatus()).toBe(statusCode);
  });

  it('should create an instance with different status codes', () => {
    const testCases = [
      { message: 'Not Found', statusCode: HttpStatus.NOT_FOUND },
      { message: 'Unauthorized', statusCode: HttpStatus.UNAUTHORIZED },
      {
        message: 'Internal Server Error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    ];

    testCases.forEach(({ message, statusCode }) => {
      const exception = new CustomException(message, statusCode);
      expect(exception.message).toBe(message);
      expect(exception.getStatus()).toBe(statusCode);
    });
  });

  it('should have the correct structure when converted to JSON', () => {
    const message = 'Test error message';
    const statusCode = HttpStatus.BAD_REQUEST;
    const exception = new CustomException(message, statusCode);

    const json = exception.getResponse();
    expect(json).toEqual({
      statusCode: statusCode,
      message: message,
    });
  });
});
