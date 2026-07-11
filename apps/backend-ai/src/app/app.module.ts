import { PrismaService } from '@agentrepo/infrastructure';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { HealthModule } from '../health/health.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [SentryModule.forRoot(), HealthModule, WorkflowModule],
  controllers: [],
  providers: [
    PrismaService,
    // No-op unless Sentry.init ran (see src/instrument.ts).
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
  ],
})
export class AppModule { }
