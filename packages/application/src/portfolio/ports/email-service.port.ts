export interface EmailAttachment {
  filename: string;
  content: Uint8Array;
  contentType?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export interface EmailServicePort {
  sendEmail(input: SendEmailInput): Promise<void>;
}
