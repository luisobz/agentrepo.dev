import { describe, expect, it } from 'vitest';
import { ReactPdfGeneratorService } from './pdf-generator.service';

describe('ReactPdfGeneratorService', () => {
  it('renders a valid PDF buffer with the %PDF magic bytes', async () => {
    const service = new ReactPdfGeneratorService();

    const pdf = await service.generateCVWithAnalysis({
      recipientName: 'jane@company.com',
      subject: 'freelance',
      aiAnalysisText:
        'Jane needs help building a RAG pipeline.\n\nLuis has shipped comparable LLM orchestration systems.',
    });

    expect(pdf.length).toBeGreaterThan(500);
    expect(Buffer.from(pdf.slice(0, 4)).toString('ascii')).toBe('%PDF');
  });
});
