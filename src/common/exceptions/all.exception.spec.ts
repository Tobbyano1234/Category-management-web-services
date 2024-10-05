import { AllExceptionsFilter } from './all.exception';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle HttpException', () => {
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

    it('should handle unknown exceptions', () => {
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

      const mockException = new Error('Unknown error');

      filter.catch(mockException, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp: expect.any(String),
        path: '/test',
        message: 'Internal server error',
      });
    });
  });
});
