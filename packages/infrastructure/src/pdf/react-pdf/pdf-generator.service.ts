import { CVAnalysisPdfInput, PDFGeneratorPort } from '@agentrepo/application';
import { renderToBuffer } from '@react-pdf/renderer';
import { buildCvAnalysisDocument } from './cv-template';

/**
 * Renders the CV + analysis report fully in memory: no headless browser and
 * no temp files, which keeps the Spaceship instance light.
 */
export class ReactPdfGeneratorService implements PDFGeneratorPort {
  async generateCVWithAnalysis(input: CVAnalysisPdfInput): Promise<Uint8Array> {
    return renderToBuffer(buildCvAnalysisDocument(input));
  }
}
