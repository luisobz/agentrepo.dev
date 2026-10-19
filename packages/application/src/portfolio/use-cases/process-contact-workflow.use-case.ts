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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replyEmailHtml(analysis: string): string {
  const spanish =
    /\b(gracias|mensaje|hola|solicitud|equipo|podemos|necesitas|interés)\b/i.test(
      analysis,
    );
  const paragraphs = analysis
    .split(/\n{2,}/)
    .map(
      (block) => `<p>${escapeHtml(block.trim()).replace(/\n/g, '<br/>')}</p>`,
    )
    .join('\n');
  return [
    '<!doctype html><html><body style="margin:0;background:#f6f1e8;color:#161616;font-family:Arial,Helvetica,sans-serif">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fffcf7;border:1px solid #d8cdbd;border-radius:18px;overflow:hidden">',
    '<tr><td><img src="https://agentrepo.dev/brand/readme-banner.jpg" width="600" alt="AgentRepo.dev — Discover, learn, build" style="display:block;width:100%;height:auto;border:0"></td></tr>',
    '<tr><td style="padding:32px"><p style="font-size:11px;letter-spacing:2px;color:#7a2230;text-transform:uppercase">Contact · AgentRepo.dev</p>',
    `<h1 style="font-size:26px;line-height:1.25;margin:12px 0 24px">${spanish ? 'Gracias por contactar' : 'Thank you for reaching out'}</h1>`,
    '<div style="font-size:16px;line-height:1.7">',
    paragraphs,
    '</div>',
    `<div style="margin-top:26px;padding:18px;background:#eee5d7;border-radius:10px;font-size:14px;line-height:1.6"><strong>${spanish ? 'Tu informe de contacto' : 'Your contact report'}</strong><br>${spanish ? 'El PDF adjunto recoge esta respuesta y el perfil profesional de Luis.' : 'The attached PDF includes this reply and Luis’s professional profile.'}</div>`,
    `<p style="margin-top:24px;font-size:12px;line-height:1.6;color:#7a7065">${spanish ? 'Respuesta automática asistida por IA. No confirma disponibilidad, condiciones ni compromisos. Puedes responder a este correo para continuar la conversación.' : 'Automated AI-assisted reply. It does not confirm availability, terms or commitments. Reply to this email to continue the conversation.'}</p>`,
    '<a href="https://agentrepo.dev" style="color:#7a2230;font-size:14px;font-weight:bold">agentrepo.dev</a>',
    '</td></tr></table></td></tr></table></body></html>',
  ].join('\n');
}

const FALLBACK_ANALYSIS = [
  'Thanks for reaching out through agentrepo.dev.',
  'Your message has been received and Luis will get back to you personally as soon as possible.',
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
    await this.contactRequests.updateStatus(contactRequestId, 'PROCESSING');

    try {
      const analysis = await this.resolveAnalysis(payload);

      const pdf = await this.pdfGenerator.generateCVWithAnalysis({
        recipientName: payload.email,
        subject: payload.subject,
        aiAnalysisText: analysis,
      });

      await this.emailService.sendEmail({
        to: payload.email,
        subject: 'Your AI analysis from agentrepo.dev',
        html: replyEmailHtml(analysis),
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
      return FALLBACK_ANALYSIS;
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
      return FALLBACK_ANALYSIS;
    }
  }
}
