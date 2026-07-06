# Task 3: Generador de PDF de CV Dinámico

## Descripción
Crear el componente que actuará como plantilla dinámica para generar un documento PDF premium que contenga el currículum digital personalizado de Luis y el análisis de la consulta del usuario realizado por la IA. Se procesará enteramente en memoria en el servidor (`backend-ai`) usando `@react-pdf/renderer` para evitar archivos temporales en disco.

## Archivos a crear o modificar
- `packages/application/src/portfolio/ports/pdf-generator.port.ts` (Puerto).
- `packages/infrastructure/src/pdf/react-pdf/pdf-generator.service.ts` (Adaptador).
- `packages/infrastructure/src/pdf/react-pdf/cv-template.tsx` (Componente de plantilla con `@react-pdf/renderer`).

## Tests que deben escribirse ANTES de implementar (TDD)
- Archivo: `packages/infrastructure/src/pdf/react-pdf/pdf-generator.service.spec.ts`
- Qué debe probar:
  1. Que al invocar el generador pasándole un contenido ficticio, retorna un objeto Buffer no vacío de PDF válido (comenzando con los bytes mágicos `%PDF`).

## Criterios de finalización
- [ ] Puerto `PDFGeneratorPort` expone `generateCVWithAnalysis(userName: string, aiAnalysisText: string): Promise<Buffer>`.
- [ ] Plantilla PDF interactiva utilizando primitivas de `@react-pdf/renderer` (`Document`, `Page`, `View`, `Text`, `StyleSheet`).
- [ ] **Diseño Visual:**
  - Estructura limpia de dos columnas: Columna izquierda con información de Luis (Educación, Skills, Experiencia base) y Columna derecha conteniendo el análisis personalizado del mensaje del usuario y cómo el perfil de Luis encaja en su requerimiento.
  - Colores corporativos aplicados en los títulos.
- [ ] Adaptador `ReactPdfGeneratorService` renderiza el componente a un buffer binario mediante `pdf(MyTemplate).toBuffer()`.

## Notas Técnicas
- El generador de PDF no debe requerir un navegador headless (como Puppeteer) ya que `@react-pdf/renderer` renderiza directamente a binario nativamente en NodeJS. Esto reduce sustancialmente el consumo de RAM en Spaceship y acelera el tiempo de respuesta.
