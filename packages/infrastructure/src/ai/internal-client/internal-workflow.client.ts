import {
  ContactWorkflowDispatcher,
  ContactWorkflowPayload,
} from '@agentrepo/application';
import { WorkflowDispatchFailedError } from '@agentrepo/domain';

export interface InternalWorkflowClientConfig {
  /** Base URL of backend-ai, e.g. http://localhost:4001 */
  baseUrl: string;
  /** Shared secret sent as the x-internal-key header. */
  internalKey: string;
  /** Abort the request after this many milliseconds (default 10s). */
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * HTTP adapter for the BFF → backend-ai hand-off. Errors reject the returned
 * promise; the caller (SubmitContact) decides how to react.
 */
export class InternalWorkflowClient implements ContactWorkflowDispatcher {
  constructor(private readonly config: InternalWorkflowClientConfig) {}

  async dispatch(payload: ContactWorkflowPayload): Promise<void> {
    const base = this.config.baseUrl.replace(/\/$/, '');
    const response = await fetch(`${base}/api/internal/workflow/contact`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-key': this.config.internalKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new WorkflowDispatchFailedError(
        `backend-ai rejected the contact workflow: HTTP ${response.status}`
      );
    }
  }
}
