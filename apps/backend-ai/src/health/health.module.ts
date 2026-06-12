import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '@agentrepo/infrastructure';

@Module({
    imports: [],
    controllers: [HealthController],
    providers: [PrismaService],
})
export class HealthModule { }