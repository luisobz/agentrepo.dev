import { Module } from '@nestjs/common';
import { PrismaService } from '@agentrepo/infrastructure';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
