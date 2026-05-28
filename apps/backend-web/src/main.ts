/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaService } from '@agentrepo/infrastructure';
import { AppModule } from './app/app.module';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '@agentrepo/trpc';
import { backendEnv } from '@agentrepo/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  app.enableCors();

  const prisma = app.get(PrismaService);

  app.use(
    '/api/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => ({ prisma }),
    })
  );

  const port = backendEnv?.BACKEND_WEB_PORT ?? process.env.PORT ?? 4000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
