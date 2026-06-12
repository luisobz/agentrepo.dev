import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Prisma 7 requires an explicit driver adapter; the classic url-only
    // datasource bootstrapping is gone.
    super({
      adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
      log:
        (process.env['NODE_ENV'] === 'development'
          ? ['query', 'warn']
          : ['warn']),
    });
  }

  async onModuleInit() {
    // En tests unitarios no queremos conexiones reales
    if (process.env['NODE_ENV'] !== 'test') {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    if (process.env['NODE_ENV'] !== 'test') {
      await this.$disconnect();
    }
  }
}
