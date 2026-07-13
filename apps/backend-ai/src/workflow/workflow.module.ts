import { ProcessContactWorkflow } from '@agentrepo/application';
import { Logger, Module } from '@nestjs/common';
import { createLangfuseCallbackIfConfigured } from './langfuse';
import {
  DeepSeekLLMService,
  PrismaContactRequestRepository,
  PrismaService,
  ReactPdfGeneratorService,
  SpacemailService,
} from '@agentrepo/infrastructure';
import { BackendEnvironments } from '@agentrepo/config';
import { ContactWorkflowController } from './contact-workflow.controller';
import { InternalKeyGuard } from './internal-key.guard';
import { CONTACT_WORKFLOW_USE_CASE } from './workflow.tokens';

@Module({
  controllers: [ContactWorkflowController],
  providers: [
    PrismaService,
    InternalKeyGuard,
    {
      provide: CONTACT_WORKFLOW_USE_CASE,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) => {
        const logger = new Logger('ContactWorkflow');
        return new ProcessContactWorkflow(
          new DeepSeekLLMService(
            {
              apiKey: BackendEnvironments.DEEPSEEK_API_KEY,
              model: BackendEnvironments.DEEPSEEK_MODEL,
              baseUrl: BackendEnvironments.DEEPSEEK_BASE_URL,
            },
            createLangfuseCallbackIfConfigured()
          ),
          new ReactPdfGeneratorService(),
          new SpacemailService({
            host: BackendEnvironments.SPACEMAIL_HOST,
            port: BackendEnvironments.SPACEMAIL_PORT,
            user: BackendEnvironments.SPACEMAIL_USER,
            pass: BackendEnvironments.SPACEMAIL_PASS,
            fromName: 'AgentRepo.dev AI Agent',
          }),
          new PrismaContactRequestRepository(prisma),
          {
            warn: (message) => logger.warn(message),
            error: (message, stack) => logger.error(message, stack),
          },
          { notificationEmail: BackendEnvironments.CONTACT_FORM_NOTIFICATION_EMAIL }
        );
      },
    },
  ],
})
export class WorkflowModule {}
