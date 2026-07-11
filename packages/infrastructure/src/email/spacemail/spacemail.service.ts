import { EmailServicePort, SendEmailInput } from '@agentrepo/application';
import nodemailer, { Transporter } from 'nodemailer';

export interface SpacemailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  /** Display name used in the From header; the address is always `user`. */
  fromName?: string;
}

/**
 * Nodemailer adapter for Spaceship's Spacemail SMTP. The sender is pinned to
 * the authenticated mailbox to keep SPF/DKIM aligned.
 */
export class SpacemailService implements EmailServicePort {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: SpacemailConfig, transporter?: Transporter) {
    this.transporter =
      transporter ??
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: { user: config.user, pass: config.pass },
      });
    this.from = config.fromName
      ? `"${config.fromName}" <${config.user}>`
      : config.user;
  }

  async sendEmail(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content),
        contentType: attachment.contentType,
      })),
    });
  }
}
