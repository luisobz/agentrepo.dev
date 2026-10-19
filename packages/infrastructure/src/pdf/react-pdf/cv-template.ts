import { BRAND_LOGO } from '../../brand/logo';
import type { CVAnalysisPdfInput } from '@agentrepo/application';
import {
  Document,
  Image,
  type DocumentProps,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { createElement as h, type ReactElement } from 'react';

// Corporate palette (mirrors the web design tokens).
const COLORS = {
  ink: '#1b1714',
  accent: '#7a2230',
  muted: '#8d8273',
  paper: '#fdf8ef',
  line: '#e5dccb',
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: COLORS.paper,
    color: COLORS.ink,
    fontSize: 10,
    padding: 32,
    fontFamily: 'Helvetica',
  },
  sidebar: {
    width: '34%',
    paddingRight: 18,
    borderRightWidth: 1,
    borderRightColor: COLORS.line,
  },
  main: { width: '66%', paddingLeft: 18 },
  name: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: COLORS.accent },
  role: { fontSize: 11, color: COLORS.muted, marginTop: 2, marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  item: { marginBottom: 3, lineHeight: 1.4 },
  paragraph: { marginBottom: 8, lineHeight: 1.5 },
  metaBox: {
    backgroundColor: '#f4ecdd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  metaLabel: { fontSize: 8, color: COLORS.muted, textTransform: 'uppercase' },
  metaValue: { fontSize: 10, marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 8,
    color: COLORS.muted,
    textAlign: 'center',
  },
});

const PROFILE = {
  name: 'Luis Ballester Zafra',
  role: 'Head of Engineering',
  skills: [
    'AWS · Azure · Terraform · Ansible',
    'Security, identity and secrets management',
    'CI/CD · GitHub Actions',
    'TypeScript · Next.js · React · NestJS',
    'AI workflows and LLM orchestration',
    'Performance and API observability',
  ],
  experience: [
    'ClickDefense · Head of Engineering · July 2026 – present',
    'Product engineering, cloud infrastructure, security and automation.',
    'AgentRepo.dev · AI skills and agent project catalogue.',
  ],
};

function section(title: string, children: ReactElement[]): ReactElement {
  return h(
    View,
    {},
    h(Text, { style: styles.sectionTitle }, title),
    ...children,
  );
}

function textItems(items: string[]): ReactElement[] {
  return items.map((item, index) =>
    h(Text, { key: index, style: styles.item }, `• ${item}`),
  );
}

function analysisParagraphs(analysis: string): ReactElement[] {
  return analysis
    .split(/\n{2,}/)
    .filter((block) => block.trim().length > 0)
    .map((block, index) =>
      h(Text, { key: index, style: styles.paragraph }, block.trim()),
    );
}

export function buildCvAnalysisDocument(
  input: CVAnalysisPdfInput,
): ReactElement<DocumentProps> {
  const spanish =
    /\b(gracias|mensaje|hola|solicitud|equipo|podemos|interés)\b/i.test(
      input.aiAnalysisText,
    );
  return h(
    Document,
    { title: 'AgentRepo.dev — Contact report', author: 'Luis Ballester Zafra' },
    h(
      Page,
      { size: 'A4', style: styles.page },
      h(
        View,
        { style: styles.sidebar },
        h(Image, {
          src: BRAND_LOGO,
          style: { width: 44, height: 44, marginBottom: 18 },
        }),
        h(Text, { style: styles.name }, PROFILE.name),
        h(Text, { style: styles.role }, PROFILE.role),
        section('Skills', textItems(PROFILE.skills)),
        section('Experience', textItems(PROFILE.experience)),
      ),
      h(
        View,
        { style: styles.main },
        h(
          View,
          { style: styles.metaBox },
          h(
            Text,
            { style: styles.metaLabel },
            spanish ? 'Preparado para' : 'Prepared for',
          ),
          h(Text, { style: styles.metaValue }, input.recipientName),
          h(
            Text,
            { style: { ...styles.metaLabel, marginTop: 6 } },
            spanish ? 'Motivo' : 'Topic',
          ),
          h(Text, { style: styles.metaValue }, input.subject),
        ),
        h(
          Text,
          { style: styles.sectionTitle },
          spanish ? 'Tu informe de contacto' : 'Your contact report',
        ),
        ...analysisParagraphs(input.aiAnalysisText),
      ),
      h(
        Text,
        { style: styles.footer, fixed: true },
        'AgentRepo.dev · AI-assisted reply · No availability or commitments are confirmed',
      ),
    ),
  );
}
