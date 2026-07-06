import type { ContactWorkflowPayload } from '@agentrepo/application';
import { CONTACT_SUBJECTS } from '@agentrepo/trpc/schemas';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Inject,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { InternalKeyGuard } from './internal-key.guard';
import { CONTACT_WORKFLOW_USE_CASE, type ContactWorkflowUseCase } from './workflow.tokens';

const contactWorkflowSchema = z.object({
  contactRequestId: z.uuid(),
  email: z.email().max(320),
  subject: z.enum(CONTACT_SUBJECTS),
  message: z.string().trim().min(1).max(5_000),
});

@Controller('internal/workflow')
@UseGuards(InternalKeyGuard)
export class ContactWorkflowController {
  private readonly logger = new Logger(ContactWorkflowController.name);

  constructor(
    @Inject(CONTACT_WORKFLOW_USE_CASE)
    private readonly processContactWorkflow: ContactWorkflowUseCase
  ) {}

  @Post('contact')
  @HttpCode(202)
  accept(@Body() body: unknown): { accepted: true } {
    const parsed = contactWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(z.treeifyError(parsed.error));
    }

    // 202: the heavy pipeline (LLM → PDF → email) runs after the response.
    this.runInBackground(parsed.data);
    return { accepted: true };
  }

  private runInBackground(payload: ContactWorkflowPayload): void {
    Promise.resolve(
      this.processContactWorkflow.execute(payload)
    ).catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Contact workflow crashed for ${payload.contactRequestId}: ${reason}`,
        error instanceof Error ? error.stack : undefined
      );
    });
  }
}
