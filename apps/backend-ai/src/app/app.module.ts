import { PrismaService } from '@agentrepo/infrastructure';
import { Module } from '@nestjs/common';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
