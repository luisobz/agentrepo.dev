import type { ContactSubject } from '@agentrepo/domain';

export interface ContactAnalysisInput {
  senderEmail: string;
  subject: ContactSubject;
  message: string;
}

/**
 * Port for the LLM that analyses a contact request and drafts the
 * personalised response included in the email + PDF report.
 */
export interface LLMServicePort {
  generateContactAnalysis(input: ContactAnalysisInput): Promise<string>;
}
