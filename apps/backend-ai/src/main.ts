import './instrument';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { BackendEnvironments } from '@agentrepo/config';
import { initLangfuseTracing } from './workflow/langfuse';

async function bootstrap() {
  initLangfuseTracing();
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());
  // backend-ai only accepts server-to-server internal calls (guarded by
  // INTERNAL_COMMUNICATION_API_SECRET); no browser origin should ever reach it.
  app.enableCors({ origin: false });
  const port = BackendEnvironments.BACKEND_AI_PORT;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
