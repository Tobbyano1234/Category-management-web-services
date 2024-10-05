import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http.exception';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException and return proper response', () => {
      const mockJson = jest.fn();
      const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
      const mockGetRequest = jest.fn().mockReturnValue({ url: '/test' });
      const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
      const mockHttpArgumentsHost = jest.fn().mockReturnValue({
        getResponse: mockGetResponse,
        getRequest: mockGetRequest,
      });

      const mockArgumentsHost: ArgumentsHost = {
        switchToHttp: mockHttpArgumentsHost,
        getArgByIndex: jest.fn(),
        getArgs: jest.fn(),
        getType: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
      };

      const mockException = new HttpException(
        'Test exception',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(mockException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: expect.any(String),
        path: '/test',
        message: 'Test exception',
      });
    });

    it('should handle different types of HttpExceptions', () => {
      const testCases = [
        {
          exception: new HttpException('Not Found', HttpStatus.NOT_FOUND),
          expectedStatus: HttpStatus.NOT_FOUND,
        },
        {
          exception: new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
          expectedStatus: HttpStatus.UNAUTHORIZED,
        },
        {
          exception: new HttpException(
            'Server Error',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
          expectedStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      ];

      testCases.forEach(({ exception, expectedStatus }) => {
        const mockJson = jest.fn();
        const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        const mockGetRequest = jest.fn().mockReturnValue({ url: '/test' });
        const mockGetResponse = jest
          .fn()
          .mockReturnValue({ status: mockStatus });
        const mockHttpArgumentsHost = jest.fn().mockReturnValue({
          getResponse: mockGetResponse,
          getRequest: mockGetRequest,
        });

        const mockArgumentsHost: ArgumentsHost = {
          switchToHttp: mockHttpArgumentsHost,
          getArgByIndex: jest.fn(),
          getArgs: jest.fn(),
          getType: jest.fn(),
          switchToRpc: jest.fn(),
          switchToWs: jest.fn(),
        };

        filter.catch(exception, mockArgumentsHost);

        expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
        expect(mockJson).toHaveBeenCalledWith({
          statusCode: expectedStatus,
          timestamp: expect.any(String),
          path: '/test',
          message: exception.message,
        });
      });
    });
  });
});
