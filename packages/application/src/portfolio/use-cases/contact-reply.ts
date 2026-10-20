export const CONTACT_EMAIL = 'agent@agentrepo.dev';
export type ContactLocale = 'es' | 'en';

export function contactLocale(message: string): ContactLocale {
  return /[¿¡]|\b(hola|gracias|quiero|proyecto|puedes|sobre|necesito|consulta|presentar|interesa)\b/i.test(
    message,
  )
    ? 'es'
    : 'en';
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function replyEmailHtml(
  analysis: string,
  locale: ContactLocale,
): string {
  const es = locale === 'es';
  const paragraphs = analysis
    .split(/\n{2,}/)
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px">${escapeHtml(block.trim()).replace(/\n/g, '<br>')}</p>`,
    )
    .join('');
  return `<!doctype html><html lang="${locale}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><style>@media(max-width:600px){.outer{padding:8px!important}.content{padding:22px 18px!important}.card{border-radius:12px!important}}a{color:#7a2230}</style></head>
<body style="margin:0;background:#f6f1e8;color:#161616;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td class="outer" align="center" style="padding:24px 12px"><table class="card" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffcf7;border:1px solid #d8cdbd;border-radius:16px;overflow:hidden">
<tr><td><img src="https://agentrepo.dev/brand/readme-banner.jpg" width="600" alt="AgentRepo.dev" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
<tr><td class="content" style="padding:28px 26px"><h1 style="font-size:24px;line-height:1.25;margin:0 0 22px;color:#161616">${es ? 'Gracias por escribirnos' : 'Thanks for getting in touch'}</h1><div style="font-size:16px;line-height:1.6;color:#26211d">${paragraphs}</div>
<p style="font-size:14px;line-height:1.5;color:#71665b;margin:22px 0">${es ? 'Encontrarás un resumen de tu consulta en el PDF adjunto.' : 'A summary of your enquiry is attached as a PDF.'}</p>
<table role="presentation" width="100%" style="border-top:1px solid #d8cdbd"><tr><td style="padding-top:20px;font-size:14px;line-height:1.7;color:#26211d"><strong>${es ? 'Equipo de AgentRepo.dev' : 'The AgentRepo.dev team'}</strong><br><a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a><br><a href="https://agentrepo.dev">agentrepo.dev</a><p style="margin:12px 0 0">${es ? 'Responde a este correo para continuar la conversación.' : 'Reply to this email to continue the conversation.'}</p><p style="font-size:11px;color:#71665b;margin:12px 0 0">${es ? 'Respuesta automática asistida por IA.' : 'Automated AI-assisted reply.'}</p></td></tr></table></td></tr></table></td></tr></table></body></html>`;
}
