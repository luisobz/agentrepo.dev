import type { ContactSubject } from '@agentrepo/domain';

export interface ContactWorkflowPayload {
  contactRequestId: string;
  email: string;
  subject: ContactSubject;
  message: string;
}

/**
 * Outbound port used by the BFF to hand the heavy AI workflow over to
 * backend-ai. Implementations must resolve/reject, never fire-and-forget:
 * the use case decides whether to await.
 */
export interface ContactWorkflowDispatcher {
  dispatch(payload: ContactWorkflowPayload): Promise<void>;
}
