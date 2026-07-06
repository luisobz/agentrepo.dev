export interface CVAnalysisPdfInput {
  /** Name or email of the person who submitted the contact form. */
  recipientName: string;
  /** Subject the sender picked in the contact form. */
  subject: string;
  /** Markdown/plain-text analysis produced by the LLM. */
  aiAnalysisText: string;
}

/**
 * Port for the in-memory PDF renderer that produces the personalised
 * CV + analysis report attached to the reply email.
 */
export interface PDFGeneratorPort {
  generateCVWithAnalysis(input: CVAnalysisPdfInput): Promise<Uint8Array>;
}
