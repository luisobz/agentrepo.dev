import { BRAND_LOGO } from '../../brand/logo';
import type { CVAnalysisPdfInput } from '@agentrepo/application';
import {
  Document,
  Image,
  Link,
  type DocumentProps,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { createElement as h, type ReactElement } from 'react';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fffcf7',
    color: '#26211d',
    padding: 28,
    paddingBottom: 42,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d8cdbd',
    paddingBottom: 14,
    marginBottom: 16,
  },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#7a2230' },
  muted: { fontSize: 9, color: '#71665b', marginTop: 4 },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#7a2230',
    marginBottom: 14,
  },
  label: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#7a2230',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: { fontSize: 10, lineHeight: 1.45, marginBottom: 10 },
  excerpt: {
    backgroundColor: '#f6f1e8',
    padding: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  signature: {
    borderTopWidth: 1,
    borderTopColor: '#d8cdbd',
    paddingTop: 12,
    marginTop: 12,
  },
  link: {
    color: '#7a2230',
    fontSize: 10,
    marginTop: 5,
    textDecoration: 'none',
  },
  footer: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 20,
    fontSize: 8,
    color: '#71665b',
  },
});

const TOPICS: Record<string, [string, string]> = {
  employment: ['Oportunidad profesional', 'Career opportunity'],
  freelance: ['Colaboración', 'Collaboration'],
  question: ['Consulta', 'Enquiry'],
  other: ['Contacto', 'Contact'],
};
function paragraphs(text: string): ReactElement[] {
  return text
    .split(/\n{2,}/)
    .filter((block) => block.trim())
    .map((block, index) =>
      h(Text, { key: index, style: styles.paragraph }, block.trim()),
    );
}

export function buildCvAnalysisDocument(
  input: CVAnalysisPdfInput,
): ReactElement<DocumentProps> {
  const es = input.locale === 'es';
  const contact = input.contactEmail ?? 'agent@agentrepo.dev';
  const topic =
    TOPICS[input.subject]?.[es ? 0 : 1] ?? (es ? 'Consulta' : 'Enquiry');
  const message = input.originalMessage?.trim();
  const excerpt =
    message && message.length > 240 ? message.slice(0, 237) + '…' : message;
  return h(
    Document,
    {
      title: es
        ? 'AgentRepo.dev — Tu consulta'
        : 'AgentRepo.dev — Your enquiry',
      author: 'AgentRepo.dev',
    },
    h(
      Page,
      { size: 'A5', style: styles.page },
      h(
        View,
        { style: styles.header },
        h(Image, {
          src: BRAND_LOGO,
          style: { width: 34, height: 34, marginRight: 10 },
        }),
        h(
          View,
          {},
          h(Text, { style: styles.brand }, 'agentrepo.dev'),
          h(
            Text,
            { style: styles.muted },
            es
              ? 'Skills y proyectos de agentes de IA'
              : 'AI skills and agent projects',
          ),
        ),
      ),
      h(
        Text,
        { style: styles.title },
        es ? 'Respuesta a tu consulta' : 'A reply to your enquiry',
      ),
      h(Text, { style: styles.muted }, input.recipientName),
      h(Text, { style: styles.muted }, topic),
      ...(excerpt
        ? [
            h(
              Text,
              { style: styles.label },
              es ? 'Tu mensaje' : 'Your message',
            ),
            h(View, { style: styles.excerpt }, ...paragraphs(excerpt)),
          ]
        : []),
      h(Text, { style: styles.label }, es ? 'Nuestra respuesta' : 'Our reply'),
      ...paragraphs(input.aiAnalysisText),
      ...(input.includeProfile
        ? [
            h(
              Text,
              { style: styles.label },
              'Luis Ballester Zafra · Head of Engineering',
            ),
            ...paragraphs(
              es
                ? 'Desarrollo de producto, AWS y Azure, automatización de infraestructura, seguridad y CI/CD. Head of Engineering en ClickDefense desde julio de 2026.'
                : 'Product engineering, AWS and Azure, infrastructure automation, security and CI/CD. Head of Engineering at ClickDefense since July 2026.',
            ),
          ]
        : []),
      h(
        View,
        { style: styles.signature, wrap: false },
        h(
          Text,
          { style: { fontFamily: 'Helvetica-Bold', fontSize: 10 } },
          es ? 'Equipo de AgentRepo.dev' : 'The AgentRepo.dev team',
        ),
        h(Link, { src: `mailto:${contact}`, style: styles.link }, contact),
        h(
          Link,
          { src: 'https://agentrepo.dev', style: styles.link },
          'agentrepo.dev',
        ),
        h(
          Text,
          { style: styles.muted },
          es
            ? 'Escríbenos para continuar la conversación.'
            : 'Email us to continue the conversation.',
        ),
      ),
      h(
        Text,
        { style: styles.footer, fixed: true },
        es
          ? 'Respuesta automática asistida por IA.'
          : 'Automated AI-assisted reply.',
      ),
    ),
  );
}
