# Task 3: Portfolio Capabilities (Tarjetas de Habilidades)

## Descripción
Crear la sección que expone los pilares de competencia técnica bajo una cuadrícula interactiva de "Capabilities" (ej. AI Orchestration, Hexagonal Architecture Backend, Premium Frontend UI).

## Archivos a crear o modificar
- `apps/web/src/modules/web-portfolio/components/portfolio-capabilities.tsx`

## Criterios de finalización
- [ ] Implementar el componente `PortfolioCapabilities` en `apps/web/src/modules/web-portfolio/components/portfolio-capabilities.tsx`.
- [ ] **Diseño Visual:**
  - Grid auto-adaptable (1 columna en móvil, 3 en escritorio).
  - Cada tarjeta representa un pilar:
    1. **AI & Agentic Orchestration:** LangChain, DeepSeek, embeddings, vector databases, tracing.
    2. **Robust Backend:** NestJS, Arquitectura Hexagonal, Prisma, PostgreSQL FTS, tRPC.
    3. **Premium UI/UX:** Next.js (App Router), Framer Motion, Tailwind CSS v4, interfaces dinámicas.
  - Uso de iconos limpios (ej. Lucide Icons como `Cpu`, `Layers`, `Sparkles`) al inicio de cada tarjeta.
  - Cada habilidad o tecnología secundaria se renderiza como un chip/tag de alta estética (`TypeChip` del design system).
- [ ] **Animación:**
  - Efecto hover de "glow" o gradiente en el borde del card (estilo glassmorphic premium).
  - Animación secuencial de entrada de las tarjetas usando Framer Motion (variantes con retraso escalonado `staggerChildren`).
