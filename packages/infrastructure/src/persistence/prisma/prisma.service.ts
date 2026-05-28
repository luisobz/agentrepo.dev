import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
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