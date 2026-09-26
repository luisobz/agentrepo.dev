import './instrument';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PrismaService } from '@agentrepo/infrastructure';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '@agentrepo/trpc';
import { BackendEnvironments } from '@agentrepo/config';
import { buildCreateContext } from './trpc/trpc-context';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // LiteSpeed forwards Passenger's BaseURI as part of req.url.
  const baseUri = process.env.NODE_ENV === 'production' ? 'web/api/v1/' : '';
  const globalPrefix = `${baseUri}api`;
  app.setGlobalPrefix(globalPrefix);

  app.use(helmet());
  // Trust the reverse proxy (Passenger/cPanel) so `req.ip` reflects the real
  // client address used for rate limiting instead of the proxy's.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.enableCors({
    origin: [BackendEnvironments.WEB_APP_URL, BackendEnvironments.ADMIN_APP_URL],
  });

  const prisma = app.get(PrismaService);

  app.use(
    `/${globalPrefix}/trpc`,
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: buildCreateContext(prisma),
    })
  );

  const port = BackendEnvironments.BACKEND_WEB_PORT;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
