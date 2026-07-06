import type { ContactSubject } from '@agentrepo/domain';
import { UseCase } from '../../shared/base.use-case';
import type { AppLoggerPort } from '../ports/app-logger.port';
import type { ContactRequestRepository } from '../ports/contact-request.repository';
import type { ContactWorkflowDispatcher } from '../ports/contact-workflow-dispatcher';

export interface SubmitContactInput {
  email: string;
  subject: ContactSubject;
  message: string;
}

export interface SubmitContactResult {
  success: true;
  id: string;
}

/**
 * Persists the contact request and hands it to backend-ai WITHOUT awaiting:
 * the user gets an instant confirmation while the AI workflow (LLM + PDF +
 * email) runs in the background. Dispatch failures are logged and the
 * request is marked FAILED so it can be retried from the admin panel.
 */
export class SubmitContact
  implements UseCase<SubmitContactInput, SubmitContactResult>
{
  constructor(
    private readonly contactRequests: ContactRequestRepository,
    private readonly workflowDispatcher: ContactWorkflowDispatcher,
    private readonly logger: AppLoggerPort
  ) {}

  async execute(input: SubmitContactInput): Promise<SubmitContactResult> {
    const created = await this.contactRequests.create(input);

    // Fire & forget: never block the tRPC response on the AI backend.
    this.workflowDispatcher
      .dispatch({
        contactRequestId: created.id,
        email: created.email,
        subject: created.subject,
        message: created.message,
      })
      .catch(async (error: unknown) => {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Contact workflow dispatch failed for ${created.id}: ${reason}`,
          error instanceof Error ? error.stack : undefined
        );
        try {
          await this.contactRequests.updateStatus(created.id, 'FAILED');
        } catch (updateError: unknown) {
          const updateReason =
            updateError instanceof Error
              ? updateError.message
              : String(updateError);
          this.logger.error(
            `Could not mark contact request ${created.id} as FAILED: ${updateReason}`
          );
        }
      });

    return { success: true, id: created.id };
  }
}
