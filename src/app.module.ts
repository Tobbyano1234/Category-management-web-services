import { Module } from '@nestjs/common';
import { CategoryModule } from './modules/category/category.module';
import { PrismaService } from './prisma/prisma.service';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { config } from './config/env';
import { validateEnv } from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: [config],
    }),
    SharedModule,
    PrismaModule,
    HealthModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
