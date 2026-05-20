# Plan de Refinamiento Arquitectónico — Features 04 a 18

Este documento detalla la reestructuración modular de la aplicación web y la arquitectura hexagonal para el backend, dividiendo de manera limpia y estricta el núcleo web (`web-core`), el portfolio personal (`web-portfolio`) y el flujo/consola de agentes IA (`web-workflow-agent`).

---

## 1. Estructura de Directorios Propuesta

### Frontend (`apps/web`)

Para cumplir con el requisito de modularización y separación estricta del núcleo vs portfolio vs workflow, organizaremos `apps/web/src` de la siguiente manera:

```
apps/web/src/
├── app/                              # Solo Rutas y Definición de Layouts (Controladores del Frontend)
│   ├── layout.tsx                    # Layout global y Root Providers
│   ├── page.tsx                      # Importa y renderiza desde modules/web-core/home
│   ├── api/                          # Endpoints auxiliares
│   ├── skills/                       # Rutas públicas de Skills
│   │   ├── page.tsx                  # Importa de modules/web-core/skills
│   │   └── [slug]/page.tsx
│   ├── agents/                       # Rutas públicas de Agentes
│   │   ├── page.tsx                  # Importa de modules/web-core/agents
│   │   └── [slug]/page.tsx           # Importa de modules/web-core/agents + web-workflow-agent
│   ├── blog/                         # Rutas del Blog
│   │   ├── page.tsx                  # Importa de modules/web-core/blog
│   │   └── [slug]/page.tsx
│   └── portfolio/                    # Ruta del Portfolio
│       └── [slug]/page.tsx           # Importa de modules/web-portfolio (CV moderno)
│
├── modules/                          # 📂 Capa de Módulos (Lógica de Negocio y Presentación Separada)
│   ├── shared/                       # Componentes visuales y utilidades transversales
│   │   └── avatar/                   # Feature 04: Avatar Global
│   │       ├── avatar-context.tsx    # Contexto global de animación y posición
│   │       ├── avatar-sprite.tsx     # Renderizador de Sprite SVG / CSS Art
│   │       ├── avatar-slot.tsx       # Contenedor dinámico de avatar
│   │       └── use-avatar.ts         # Hook personalizado
│   │
│   ├── web-core/                     # 🏠 Núcleo del Sitio Web Público
│   │   ├── home/                     # Feature 05 y 06
│   │   │   ├── components/           # Hero, LatestSection, HeaderDinamico Bubble
│   │   │   └── search/               # Buscador Raycast-style
│   │   ├── skills/                   # Feature 09
│   │   │   └── components/           # SkillsList, SkillDetail, MonacoMarkdownViewer
│   │   ├── agents/                   # Feature 11
│   │   │   └── components/           # AgentsList, AgentIdeLayout, FileTree, CodeTabs
│   │   └── blog/                     # Feature 12
│   │       └── components/           # MicroPostsList, MicroPostCard, PostDetail
│   │
│   ├── web-portfolio/                # 💼 Portfolio de AI Engineering (Feature 13 y 15)
│   │   ├── components/
│   │   │   ├── portfolio-hero.tsx    # CV digital estilo moderno (Name & Role)
│   │   │   ├── portfolio-timeline.tsx# Timeline interactiva animada
│   │   │   ├── portfolio-capabilities.tsx # Cards con capacidades y tecnologías
│   │   │   └── contact-form.tsx      # Formulario de contacto "agentico"
│   │   ├── hooks/
│   │   │   └── use-portfolio-contact.ts # Control del formulario y submit tRPC
│   │   └── types/
│   │
│   └── web-workflow-agent/           # 🤖 Flujo y Consola del Agente (Feature 16)
│       ├── components/
│       │   ├── playground-console.tsx # Consola interactiva/consola de terminal
│       │   ├── playground-chat.tsx    # Interfaz de conversación con el agente
│       │   └── playground-config.tsx  # Input de token y selección de modo (Real vs Dummy)
│       └── hooks/
│           ├── use-playground-dummy.ts# Simulación paso a paso paso (escribir lento, thinking)
│           └── use-playground-real.ts # Conexión SSE/streaming usando el token real
```

---

## 2. Definición Hexagonal para Backend (`packages/`)

Seguiremos la estructura de programación hexagonal, asegurando dependencias unidireccionales estrictas hacia adentro.

### packages/domain (TypeScript Puro)
Define las entidades de negocio. Cero frameworks.
- **skills/**: `Skill`
- **agents/**: `Agent`, `AgentFile` (Estructura de ficheros plana con propiedad `path` para simplificar la consulta en base de datos).
- **blog/**: `BlogPost`
- **portfolio/**: `ContactRequest` (Datos del remitente, mensaje, estado del workflow `PENDING | PROCESSING | SUCCESS | FAILED`).
- **playground/**: `PlaygroundToken` (Tokens temporales con fecha de expiración y alcance de ejecuciones).

### packages/application (Puertos e Interfaces de Casos de Uso)
- **skills/**: `GetSkillsUseCase`, `CreateSkillUseCase`, `SkillRepositoryPort`
- **agents/**: `GetAgentUseCase`, `CreateAgentUseCase`, `AgentRepositoryPort`
- **blog/**: `GetBlogPostsUseCase`, `CreateBlogPostUseCase`, `BlogPostRepositoryPort`
- **portfolio/**:
  - `SubmitContactUseCase`: Guarda en DB y despacha asíncronamente al BFF.
  - `ProcessContactWorkflowUseCase`: Orquesta la llamada a DeepSeek, generación de PDF y envío por correo.
  - Puertos: `ContactRepositoryPort`, `LLMServicePort`, `EmailServicePort`, `PDFGeneratorPort`.
- **playground/**: `GenerateTokenUseCase`, `ValidateTokenUseCase`, `TokenRepositoryPort`

### packages/infrastructure (Adaptadores Concretos)
- **persistence/prisma/**: PrismaService y Repositorios correspondientes.
- **ai/deepseek/**: Adaptador de LangChain con llamadas a DeepSeek v4 e integración con Langfuse para trazas y observabilidad en producción.
- **email/spacemail/**: Inyección de Nodemailer con configuración SMTP personalizada de Spacemail.
- **pdf/generator/**: Adaptador con `@react-pdf/renderer` para renderizar el PDF CV Dinámico en memoria como un buffer o stream para adjuntarlo en el correo.

---

## 3. Cuestiones Arquitectónicas y Decisiones Propuestas

Para asegurar el éxito del desarrollo con cualquier modelo (incluyendo modelos menos capaces), proponemos las siguientes soluciones a puntos ambiguos:

1. **Estructura del Árbol de Archivos de los Agentes (`AgentFile`)**:
   - *Decisión:* Guardaremos los archivos de los agentes en una relación 1 a N de tipo `AgentFile` con columnas `path` (ej. `src/index.js`) y `content` (ej. `console.log("hola")`). La construcción del árbol visual de directorios para la UI se realizará en memoria en el frontend a partir de los paths plans. Esto es sumamente eficiente y evita la complejidad y lentitud de relaciones recursivas en SQL.
   
2. **Generación del PDF en NestJS (`backend-ai`)**:
   - *Decisión:* Utilizaremos `@react-pdf/renderer` en NodeJS para generar un stream de PDF al vuelo en memoria a partir de los datos procesados del contacto por el LLM. El PDF resultante se enviará directamente como un array de bytes al adaptador de correo para adjuntarse sin guardarlo en el disco local del contenedor, evitando problemas de persistencia efímera en Spaceship.

3. **Modo Dummy del Playground de Agentes**:
   - *Decisión:* Diseñaremos un hook de simulación con scripts pre-construidos específicos para cada agente. Por ejemplo, el agente "Code Reviewer" simulará pasos como `[1/4] Analizando workspace...`, `[2/4] Buscando vulnerabilidades...`, etc. Esto garantiza una animación fluida de alta calidad sin depender de costes extras ni llamadas a red en modo demostrativo. En modo Real, si el usuario tiene un Token válido, consumirá un endpoint de streaming SSE conectado a LangChain.
