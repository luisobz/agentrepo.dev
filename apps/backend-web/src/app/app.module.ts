import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaService } from '@agentrepo/infrastructure';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [SentryModule.forRoot(), HealthModule],
  controllers: [],
  providers: [
    PrismaService,
    // No-op unless Sentry.init ran (see src/instrument.ts).
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
  ],
})
export class AppModule { }
