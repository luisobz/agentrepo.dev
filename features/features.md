# AgentRepo.dev — Análisis Global y Catálogo de Features

## 1. Resumen del Análisis Global

### Arquitectura y Stack
El proyecto AgentRepo.dev es un monorepo gestionado con Nx y pnpm. Se basa en una arquitectura de cuatro aplicaciones y múltiples paquetes compartidos:
- **Apps:**
  - `apps/web`: Next.js 16 (App Router) para la web pública. Renderizado mixto (SSG para contenido, CSR para interactividad).
  - `apps/admin`: Next.js 16 para el panel de administración (CSR).
  - `apps/backend-web`: NestJS actuando como BFF (Backend for Frontend) unificado. Expone routers de tRPC.
  - `apps/backend-ai`: NestJS para lógica pesada (IA, Email, PDF). Expone API REST interna.
- **Packages (Arquitectura Hexagonal):**
  - `domain`: Entidades, Value Objects (puro TypeScript).
  - `application`: Puertos y Casos de uso.
  - `infrastructure`: Adaptadores (Prisma, LangChain, Spacemail, etc.).
  - `ui`, `trpc`, `config`: UI compartida, definición de tRPC y configuraciones (Tailwind, ESLint, etc.).

**Stack Tecnológico:** TypeScript, Tailwind CSS v4, shadcn/ui, Prisma, Supabase PostgreSQL, LangChain, DeepSeek V4, Langfuse.

### Dependencias entre Sistemas
- La UI (`apps/web`, `apps/admin`) depende estrictamente de `apps/backend-web` a través de tRPC.
- `apps/backend-web` depende de `apps/backend-ai` vía REST en localhost para tareas de IA (ej. flujo de contacto) para no bloquear el hilo principal del BFF.
- Ambos backends implementan interfaces definidas en `packages/application` usando adaptadores de `packages/infrastructure`.

### Riesgos Identificados
1. **Complejidad del Avatar:** Mantener el estado, la animación y el posicionamiento del avatar entre diferentes "slots" y componentes de React requerirá un contexto global robusto.
2. **Flujo Agéntico Asíncrono:** El contacto del portfolio requiere orquestación de LLMs, envío de emails y generación de PDF en segundo plano. La gestión de errores y retries será crítica para no perder contactos.
3. **Sincronización de Estado (BFF a IA):** La comunicación REST interna debe ser segura y tolerante a fallos locales.

### Cambios en el Boilerplate Actual
- **Packages:** Es necesario poblar las carpetas vacías de los paquetes (`domain`, `application`, `infrastructure`, `ui`, `trpc`) estableciendo las reglas estrictas de dependencias de Nx.
- **Configuración CSS/UI:** Inicializar Tailwind v4 centralizado en `packages/config` e importar en las apps. Configurar shadcn/ui para que escriba en `packages/ui/src/components`.
- **Prisma:** Migrar el schema actual a un modelo real y configurar la conexión a Supabase.
- **Next.js/NestJS:** Limpiar los controladores/páginas "hello world" por defecto y configurar los providers de tRPC.

---

## 2. Catálogo de Features

### Fase 1 — Fundación visual y estructural
1. **01-fundacion-design-system**
   - **Objetivo:** Establecer los cimientos visuales (colores, tipografía Geist, espaciado) usando Tailwind v4.
   - **Dependencias:** Ninguna.
   - **Criterio de aceptación:** Las variables CSS globales están definidas y los textos de prueba se renderizan con las fuentes y colores correctos.
   - **Tasks:**
     - task-1-tailwind-config.md
     - task-2-tipografia-fuentes.md
     - task-3-tokens-css-globales.md

2. **02-fundacion-core-components**
   - **Objetivo:** Implementar los componentes UI base (botones, inputs, cards) adaptados al Design System.
   - **Dependencias:** 01-fundacion-design-system.
   - **Criterio de aceptación:** Botones, inputs y cards se ven y se comportan según el spec visual, incluyendo estados hover/focus.
   - **Tasks:**
     - task-1-shadcn-setup.md
     - task-2-componentes-botones.md
     - task-3-componentes-inputs-cards.md
     - task-4-componentes-tags-chips.md

3. **03-fundacion-arquitectura-base**
   - **Objetivo:** Construir la base de la arquitectura hexagonal, Prisma y tRPC.
   - **Dependencias:** Ninguna.
   - **Criterio de aceptación:** Un end-to-end básico (ej. un ping) fluye desde el frontend Next.js hasta el backend NestJS vía tRPC de forma tipada.
   - **Tasks:**
     - task-1-prisma-schema-setup.md
     - task-2-domain-application-core.md
     - task-3-trpc-backend-setup.md
     - task-4-trpc-frontend-provider.md

4. **04-fundacion-avatar-system**
   - **Objetivo:** Implementar la lógica central y la representación del Avatar y su sistema de slots.
   - **Dependencias:** 01-fundacion-design-system.
   - **Criterio de aceptación:** El avatar puede saltar entre dos slots diferentes en la pantalla mediante un trigger manual.
   - **Tasks:**
     - task-1-avatar-context-provider.md
     - task-2-avatar-sprite-component.md
     - task-3-avatar-slot-component.md
     - task-4-avatar-motion-logic.md

### Fase 2 — Home y Skills
5. **05-home-layout**
   - **Objetivo:** Maquetar la página de inicio pública con el hero, header dinámico y sección latest.
   - **Dependencias:** 02-fundacion-core-components, 04-fundacion-avatar-system.
   - **Criterio de aceptación:** La home se ve perfecta en desktop y mobile, y el header colapsa en una bubble al hacer scroll.
   - **Tasks:**
     - task-1-header-dinamico-bubble.md
     - task-2-home-hero-layout.md
     - task-3-home-latest-section.md
     - task-4-home-background-gradient.md

6. **06-global-search**
   - **Objetivo:** Implementar el buscador principal estilo Raycast y su backend FTS en Postgres.
   - **Dependencias:** 03-fundacion-arquitectura-base, 05-home-layout.
   - **Criterio de aceptación:** El usuario puede teclear en el buscador de la home y ver resultados mockeados o reales que vienen del backend de forma instantánea.
   - **Tasks:**
     - task-1-search-domain-infra.md
     - task-2-search-trpc-endpoint.md
     - task-3-search-ui-component.md

7. **07-skills-backend**
   - **Objetivo:** Dominio, aplicación, infraestructura y tRPC para la gestión de Skills.
   - **Dependencias:** 03-fundacion-arquitectura-base.
   - **Criterio de aceptación:** Tests de integración pasando para crear, leer, actualizar y listar skills en base de datos.
   - **Tasks:**
     - task-1-skills-domain-entities.md
     - task-2-skills-prisma-repository.md
     - task-3-skills-use-cases.md
     - task-4-skills-trpc-router.md

8. **08-skills-admin-ui**
   - **Objetivo:** Panel de administración para gestionar skills.
   - **Dependencias:** 07-skills-backend.
   - **Criterio de aceptación:** El administrador puede crear una skill, editar su contenido (markdown) y publicarla.
   - **Tasks:**
     - task-1-admin-layout-auth.md
     - task-2-skills-admin-list.md
     - task-3-skills-admin-form.md
     - task-4-monaco-editor-integration.md

9. **09-skills-public-ui**
   - **Objetivo:** Listado y detalle público de skills tipo repositorio.
   - **Dependencias:** 07-skills-backend, 02-fundacion-core-components.
   - **Criterio de aceptación:** El usuario puede navegar la lista de skills, filtrar, entrar al detalle, ver modo raw/rendered y copiar el contenido.
   - **Tasks:**
     - task-1-skills-list-page.md
     - task-2-skills-detail-layout.md
     - task-3-markdown-viewer-component.md
     - task-4-copy-download-actions.md

### Fase 3 — Agents y Blog
10. **10-agents-backend**
    - **Objetivo:** Core backend para la estructura compleja de Agentes y sus ficheros.
    - **Dependencias:** 03-fundacion-arquitectura-base.
    - **Criterio de aceptación:** Se puede persistir un agente con su árbol de ficheros asociado y recuperarlo.
    - **Tasks:**
      - task-1-agents-domain-entities.md
      - task-2-agents-repositories.md
      - task-3-agents-use-cases.md
      - task-4-agents-trpc-router.md

11. **11-agents-ui**
    - **Objetivo:** Admin y vista pública (estilo IDE) para Agentes.
    - **Dependencias:** 10-agents-backend, 09-skills-public-ui.
    - **Criterio de aceptación:** El usuario puede explorar el árbol de ficheros de un agente, abriendo varios en pestañas.
    - **Tasks:**
      - task-1-agents-admin-management.md
      - task-2-agents-list-page.md
      - task-3-agents-ide-layout.md
      - task-4-agents-file-tree-tabs.md

12. **12-blog-system**
    - **Objetivo:** Backend y frontend para los microposts del blog editorial.
    - **Dependencias:** 03-fundacion-arquitectura-base.
    - **Criterio de aceptación:** Listado limpio y minimalista de posts y detalle con referencias claras a la fuente original.
    - **Tasks:**
      - task-1-blog-backend-crud.md
      - task-2-blog-admin-ui.md
      - task-3-blog-public-list.md
      - task-4-blog-post-detail.md

### Fase 4 — Portfolio y Playground
13. **13-portfolio-ui**
    - **Objetivo:** La página de portfolio privada `/portfolio/luisbz` (diseño y maquetación).
    - **Dependencias:** 04-fundacion-avatar-system.
    - **Criterio de aceptación:** El portfolio es accesible, muestra la timeline, los capability cards y el formulario de contacto (sin lógica).
    - **Tasks:**
      - task-1-portfolio-hero-about.md
      - task-2-portfolio-timeline.md
      - task-3-portfolio-capabilities.md
      - task-4-portfolio-contact-ui.md

14. **14-ai-agent-workflow**
    - **Objetivo:** La lógica pesada de IA, email y PDF en `backend-ai`.
    - **Dependencias:** 03-fundacion-arquitectura-base.
    - **Criterio de aceptación:** Dado un input de contacto mock, el sistema invoca LangChain, DeepSeek, genera un PDF en R2 y envía emails por SMTP de forma testeada.
    - **Tasks:**
      - task-1-langchain-deepseek-adapter.md
      - task-2-spacemail-smtp-adapter.md
      - task-3-react-pdf-generator.md
      - task-4-contact-workflow-orchestration.md
      - task-5-backend-ai-rest-controller.md

15. **15-portfolio-contact-integration**
    - **Objetivo:** Conectar el form del portfolio con el workflow de IA a través del BFF.
    - **Dependencias:** 13-portfolio-ui, 14-ai-agent-workflow.
    - **Criterio de aceptación:** Un submit real en el frontend se guarda en DB, responde rápido al usuario y dispara el workflow asíncrono.
    - **Tasks:**
      - task-1-contact-trpc-endpoint.md
      - task-2-internal-rest-client.md
      - task-3-frontend-form-submission.md
      - task-4-admin-contacts-log.md

16. **16-playground-system**
    - **Objetivo:** Interfaz interactiva estilo Trello Kanban para demostración visual (mock) y ejecución real en streaming de subagentes IA de desarrollo.
    - **Dependencias:** 02-fundacion-core-components, 04-fundacion-avatar-system.
    - **Criterio de aceptación:** Se puede ejecutar una simulación guiada interactiva de Kanban con test fallidos y reparaciones de bugs, o usar un token para crear features personalizadas con streaming real de IA y previsualizaciones funcionales.
    - **Tasks:**
      - task-1-tokens-admin-backend.md
      - task-2-playground-board-ui.md
      - task-3-playground-mock-flow.md
      - task-4-playground-real-flow.md

### Fase 5 — Pulido y lanzamiento
17. **17-easter-egg-avatar**
    - **Objetivo:** La lógica de clicks y revelación del portfolio.
    - **Dependencias:** 04-fundacion-avatar-system.
    - **Criterio de aceptación:** Al hacer 5 clicks sobre el avatar, este reacciona secuencialmente y luego redirige a `/portfolio/luisbz`.
    - **Tasks:**
      - task-1-avatar-click-sequence.md

211: 18. **18-final-polish**
212:     - **Objetivo:** Rematar la experiencia (SEO, animaciones, Sentry).
213:     - **Dependencias:** Todas.
214:     - **Criterio de aceptación:** Proyecto listo para deploy con métricas y metadatos correctos.
215:     - **Tasks:**
216:       - task-1-seo-metadata.md
217:       - task-2-sentry-integration.md
