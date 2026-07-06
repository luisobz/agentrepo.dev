import { PrismaService } from '@agentrepo/infrastructure';
import { Module } from '@nestjs/common';
import { HealthModule } from '../health/health.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [HealthModule, WorkflowModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
