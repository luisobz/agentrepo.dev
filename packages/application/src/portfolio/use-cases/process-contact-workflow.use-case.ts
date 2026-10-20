import {
  CONTACT_EMAIL,
  contactLocale,
  escapeHtml,
  replyEmailHtml,
} from './contact-reply';
import { UseCase } from '../../shared/base.use-case';
import type { AppLoggerPort } from '../ports/app-logger.port';
import type { ContactRequestRepository } from '../ports/contact-request.repository';
import type { ContactWorkflowPayload } from '../ports/contact-workflow-dispatcher';
import type { EmailServicePort } from '../ports/email-service.port';
import type { LLMServicePort } from '../ports/llm-service.port';
import type { PDFGeneratorPort } from '../ports/pdf-generator.port';

export interface ProcessContactWorkflowConfig {
  /** Address that receives the internal notification copy. */
  notificationEmail: string;
}

const PDF_FILENAME = 'AgentRepo-Contact-Report.pdf';

/**
 * Suspicious payloads are processed with a canned reply instead of hitting
 * the LLM: the goal is spam/prompt-injection containment, not moderation.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(?:\w+\s+){0,3}(instructions|prompts?)/i,
  /you are now\b/i,
  /system prompt/i,
  /\bjailbreak\b/i,
];

const MAX_LINK_COUNT = 5;

export function isSuspiciousContactMessage(message: string): boolean {
  if (INJECTION_PATTERNS.some((pattern) => pattern.test(message))) {
    return true;
  }
  const linkCount = message.match(/https?:\/\//gi)?.length ?? 0;
  return linkCount > MAX_LINK_COUNT;
}

const FALLBACK_ANALYSIS = [
  'Thanks for reaching out through agentrepo.dev.',
  'Your message has been received. Reply to this email to continue the conversation.',
].join('\n\n');

/**
 * The heavy asynchronous side of the contact flow, executed in backend-ai:
 * 1. guardrail check, 2. LLM analysis, 3. PDF report, 4. reply email to the
 * sender + notification copy, 5. status transitions on ContactRequest.
 */
export class ProcessContactWorkflow
  implements UseCase<ContactWorkflowPayload, void>
{
  constructor(
    private readonly llm: LLMServicePort,
    private readonly pdfGenerator: PDFGeneratorPort,
    private readonly emailService: EmailServicePort,
    private readonly contactRequests: ContactRequestRepository,
    private readonly logger: AppLoggerPort,
    private readonly config: ProcessContactWorkflowConfig,
  ) {}

  async execute(payload: ContactWorkflowPayload): Promise<void> {
    const { contactRequestId } = payload;
    const locale = contactLocale(payload.message);
    await this.contactRequests.updateStatus(contactRequestId, 'PROCESSING');

    try {
      const analysis = await this.resolveAnalysis(payload);

      const pdf = await this.pdfGenerator.generateCVWithAnalysis({
        recipientName: payload.email,
        subject: payload.subject,
        aiAnalysisText: analysis,
        locale,
        contactEmail: CONTACT_EMAIL,
        originalMessage: payload.message,
        includeProfile:
          payload.subject === 'employment' || payload.subject === 'freelance',
      });

      await this.emailService.sendEmail({
        to: payload.email,
        replyTo: CONTACT_EMAIL,
        subject:
          locale === 'es'
            ? 'Tu consulta · AgentRepo.dev'
            : 'Your enquiry · AgentRepo.dev',
        html: replyEmailHtml(analysis, locale),
        text: `${analysis}\n\n${locale === 'es' ? 'Equipo de AgentRepo.dev' : 'The AgentRepo.dev team'}\n${CONTACT_EMAIL}\nhttps://agentrepo.dev\n\n${locale === 'es' ? 'Respuesta automática asistida por IA.' : 'Automated AI-assisted reply.'}`,
        attachments: [
          {
            filename: PDF_FILENAME,
            content: pdf,
            contentType: 'application/pdf',
          },
        ],
      });

      await this.emailService.sendEmail({
        to: this.config.notificationEmail,
        subject: `[agentrepo.dev] Nuevo contacto: ${payload.subject} — ${payload.email}`,
        html: [
          `<p><strong>De:</strong> ${escapeHtml(payload.email)}</p>`,
          `<p><strong>Asunto:</strong> ${escapeHtml(payload.subject)}</p>`,
          `<p><strong>Mensaje:</strong></p><blockquote>${escapeHtml(payload.message)}</blockquote>`,
          `<p><strong>Análisis IA:</strong></p><blockquote>${escapeHtml(analysis)}</blockquote>`,
        ].join('\n'),
      });

      await this.contactRequests.updateStatus(contactRequestId, 'COMPLETED');
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Contact workflow failed for ${contactRequestId}: ${reason}`,
        error instanceof Error ? error.stack : undefined,
      );
      await this.contactRequests.updateStatus(contactRequestId, 'FAILED');
      throw error;
    }
  }

  private async resolveAnalysis(
    payload: ContactWorkflowPayload,
  ): Promise<string> {
    if (isSuspiciousContactMessage(payload.message)) {
      this.logger.warn(
        `Contact request ${payload.contactRequestId} flagged by guardrail; using fallback reply`,
      );
      return contactLocale(payload.message) === 'es'
        ? 'Gracias por escribirnos. Hemos recibido tu consulta. Puedes continuar la conversación respondiendo a este correo.'
        : FALLBACK_ANALYSIS;
    }
    try {
      return await this.llm.generateContactAnalysis({
        senderEmail: payload.email,
        subject: payload.subject,
        message: payload.message,
      });
    } catch {
      this.logger.warn(
        `Contact request ${payload.contactRequestId}: AI unavailable after bounded attempts; using fallback`,
      );
      return contactLocale(payload.message) === 'es'
        ? 'Gracias por escribirnos. Hemos recibido tu consulta. Puedes continuar la conversación respondiendo a este correo.'
        : FALLBACK_ANALYSIS;
    }
  }
}
