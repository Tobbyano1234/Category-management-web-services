import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import {
  BadRequestException,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';

import { Environment } from './common/enums/environment-variables.enum';
import { PrismaService } from './prisma/prisma.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.service';
import { ResponseInterceptor } from './common/interceptors';
import { createDocument } from './docs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    bufferLogs: true,
  });
  const logger = new Logger('Bootstrap');

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const environment = configService.get('NODE_ENV') as Environment;

  configService.set('timezone', 'Africa/Lagos');

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: environment !== Environment.PRODUCTION,
      transform: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      stopAtFirstError: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) =>
        new BadRequestException(validationErrors, 'Bad Request'),
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(logger, configService));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    // origin: getAllowedOrigins(environment),
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  createDocument(app);

  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()} ${environment}`);
}
bootstrap();
