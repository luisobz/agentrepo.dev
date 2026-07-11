import { describe, expect, it, vi } from 'vitest';
import type { Transporter } from 'nodemailer';
import { SpacemailService } from './spacemail.service';

const CONFIG = {
  host: 'mail.spacemail.com',
  port: 465,
  user: 'agent@agentrepo.dev',
  pass: 'secret',
};

function buildTransporter() {
  const sendMail = vi.fn().mockResolvedValue({ messageId: 'msg-1' });
  return { transporter: { sendMail } as unknown as Transporter, sendMail };
}

describe('SpacemailService', () => {
  it('sends mail from the authenticated mailbox', async () => {
    const { transporter, sendMail } = buildTransporter();
    const service = new SpacemailService(CONFIG, transporter);

    await service.sendEmail({
      to: 'jane@company.com',
      subject: 'Your AI analysis',
      html: '<p>Hello</p>',
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'agent@agentrepo.dev',
        to: 'jane@company.com',
        subject: 'Your AI analysis',
        html: '<p>Hello</p>',
      })
    );
  });

  it('converts attachments to Buffers with their content type', async () => {
    const { transporter, sendMail } = buildTransporter();
    const service = new SpacemailService(
      { ...CONFIG, fromName: 'AgentRepo Agent' },
      transporter
    );
    const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]);

    await service.sendEmail({
      to: 'jane@company.com',
      subject: 'Report',
      html: '<p>Attached</p>',
      attachments: [
        {
          filename: 'Luisbz_Resume_Analysis.pdf',
          content: pdfBytes,
          contentType: 'application/pdf',
        },
      ],
    });

    const mail = sendMail.mock.calls[0][0];
    expect(mail.from).toBe('"AgentRepo Agent" <agent@agentrepo.dev>');
    expect(mail.attachments).toHaveLength(1);
    expect(mail.attachments[0].filename).toBe('Luisbz_Resume_Analysis.pdf');
    expect(Buffer.isBuffer(mail.attachments[0].content)).toBe(true);
    expect(mail.attachments[0].contentType).toBe('application/pdf');
  });
});
