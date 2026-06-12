import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@agentrepo/infrastructure';

@Controller('health')
export class HealthController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async check() {
        const isDbHealthy = await this.prisma.$queryRaw`SELECT 1`.catch(() => false);
        return {
            status: isDbHealthy ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            db: isDbHealthy ? 'connected' : 'disconnected',
        };
    }
}