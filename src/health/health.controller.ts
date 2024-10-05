import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../prisma/prisma.service';
import { ApiTags } from '@nestjs/swagger';
import { apiTags, apiVersions } from 'src/common';

@ApiTags(apiTags.health)
@Controller({ version: apiVersions.v1, path: apiTags.health })
@Controller('health-check')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealthIndicator: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealthIndicator.isHealthy('database'),
      () => ({
        server: { status: 'up', message: 'Trustcrow server is live' },
      }),
    ]);
  }
}
