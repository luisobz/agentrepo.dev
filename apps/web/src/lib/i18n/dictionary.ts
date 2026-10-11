import type { Dictionary } from '@agentrepo/ui';

export const webDictionary = {
  'nav.admin': { en: 'Admin panel', es: 'Administración' },
  'creator.useEmail': {
    en: 'Use email instead',
    es: 'Usar correo electrónico',
  },
  'creator.hideEmail': {
    en: 'Hide email access',
    es: 'Ocultar acceso por correo',
  },
  'creator.githubPending': {
    en: 'GitHub sign-in is being configured. You can register with email below.',
    es: 'Estamos terminando de configurar GitHub. Puedes registrarte con tu correo aquí abajo.',
  },
  'creator.signout': { en: 'Sign out', es: 'Cerrar sesión' },
  'creator.signin': { en: 'Sign in', es: 'Entrar' },
  'creator.signup': { en: 'Create account', es: 'Crear cuenta' },
  'creator.intro': {
    en: 'Sign in to submit skills, agent projects and articles under your name.',
    es: 'Accede para proponer skills, proyectos de agentes y artículos con tu autoría.',
  },
  'creator.github': { en: 'Connect with GitHub', es: 'Connect with GitHub' },
  'creator.connecting': { en: 'Connecting…', es: 'Conectando…' },
  'creator.authInfo': {
    en: 'Sign in as a contributor. Proposals are reviewed before publication. You can also use email.',
    es: 'Accede como colaborador. Tus propuestas se revisan antes de publicarse. También puedes usar tu correo.',
  },
  'creator.email': { en: 'Email', es: 'Correo' },
  'creator.password': { en: 'Password', es: 'Contraseña' },
  'creator.passwordHelp': {
    en: 'Use at least 10 characters. Email confirmation is required.',
    es: 'Utiliza al menos 10 caracteres. Tendrás que confirmar tu correo.',
  },
  'creator.unavailable': {
    en: 'Authentication is not configured.',
    es: 'El acceso todavía no está configurado.',
  },
  'creator.wait': { en: 'Please wait…', es: 'Espera…' },
  'creator.network': {
    en: 'Could not reach the server. Please try again.',
    es: 'No se pudo conectar. Inténtalo de nuevo.',
  },
  'creator.authFailed': {
    en: 'Authentication failed.',
    es: 'No se pudo iniciar sesión.',
  },
  'creator.registered': {
    en: 'Account created. Check your email to confirm it, then sign in.',
    es: 'Cuenta creada. Confirma tu correo y después inicia sesión.',
  },
  'creator.oauthError': {
    en: 'Could not sign in with GitHub. Please try again.',
    es: 'No se pudo acceder con GitHub. Inténtalo de nuevo.',
  },
  'creator.title': { en: 'Title', es: 'Título' },
  'creator.slug': { en: 'URL slug', es: 'Identificador de URL' },
  'creator.description': { en: 'Description', es: 'Descripción' },
  'creator.summary': { en: 'Article summary', es: 'Resumen del artículo' },
  'creator.repo': {
    en: 'Project repository (HTTPS)',
    es: 'Repositorio del proyecto (HTTPS)',
  },
  'creator.agentHelp': {
    en: 'Propose a complete agent project with installation, configuration, requirements and license documented below.',
    es: 'Propón un proyecto de agente completo y documenta su instalación, configuración, requisitos y licencia.',
  },
  'creator.skillType': { en: 'Skill type', es: 'Tipo de skill' },
  'creator.documentation': {
    en: 'Documentation and installation (Markdown)',
    es: 'Documentación e instalación (Markdown)',
  },
  'creator.article': { en: 'Article (Markdown)', es: 'Artículo (Markdown)' },
  'creator.skillContent': {
    en: 'Skill content (Markdown)',
    es: 'Contenido de la skill (Markdown)',
  },
  'creator.upload': {
    en: 'Or upload a Markdown file (.md or .txt)',
    es: 'O sube un fichero Markdown (.md o .txt)',
  },
  'creator.pendingHelp': {
    en: 'Submitted content stays unpublished until reviewed. One Markdown file can be uploaded per draft.',
    es: 'El contenido queda privado hasta su revisión. Puedes subir un fichero Markdown por propuesta.',
  },
  'creator.submit': {
    en: 'Submit draft for review',
    es: 'Enviar propuesta a revisión',
  },
  'creator.saving': { en: 'Saving…', es: 'Guardando…' },
  'creator.submitted': { en: 'Draft submitted', es: 'Propuesta enviada' },
  'creator.another': { en: 'Create another', es: 'Crear otra propuesta' },
  'creator.fileSize': {
    en: 'The Markdown file must be smaller than 100 KB.',
    es: 'El fichero Markdown debe ocupar menos de 100 KB.',
  },
  'creator.saveFailed': {
    en: 'Could not save your draft.',
    es: 'No se pudo guardar tu propuesta.',
  },
  'creator.author': { en: 'Author', es: 'Autoría' },
  'creator.heading': {
    en: 'Contribute to AgentRepo',
    es: 'Colabora con AgentRepo',
  },
  'creator.pageInfo': {
    en: 'Propose a skill, agent project or article. Your account is recorded as the author and the administrator reviews each proposal before publication.',
    es: 'Propón una skill, un proyecto de agente o un artículo. Tu cuenta queda registrada como autora y el administrador revisa cada propuesta antes de publicarla.',
  },
  'creator.access': {
    en: 'Sign in to contribute',
    es: 'Accede para colaborar',
  },
  'creator.accessInfo': {
    en: 'Proposals remain pending review. They will be published with your authorship when approved by the administrator.',
    es: 'Tus propuestas quedarán pendientes de revisión. Se publicarán con tu autoría cuando el administrador las apruebe.',
  },
  'creator.accessLink': {
    en: 'Sign in with GitHub or create an account',
    es: 'Acceder con GitHub o crear una cuenta',
  },
  'creator.successInfo': {
    en: 'Your proposal has been saved with your authorship. It will appear publicly after editorial review.',
    es: 'Tu propuesta se ha guardado con tu autoría. Aparecerá públicamente después de la revisión editorial.',
  },

  'common.loading': { en: 'Loading content…', es: 'Cargando contenido…' },
  'nav.skills': { en: 'Skills', es: 'Skills' },
  'nav.agents': { en: 'Agents', es: 'Agents' },
  'nav.blog': { en: 'Blog', es: 'Blog' },
  'nav.cli': { en: 'CLI', es: 'CLI' },
  'footer.secondary': { en: 'More from AgentRepo', es: 'Más de AgentRepo' },
  'cli.title': {
    en: 'Skills, pinned to your project.',
    es: 'Skills fijadas a tu proyecto.',
  },
  'cli.intro': {
    en: 'Install the exact skills your project needs. Choose your coding tool and keep every installation reproducible with agent.json.',
    es: 'Instala las skills exactas que necesita tu proyecto. Elige tu herramienta y mantén cada instalación reproducible con agent.json.',
  },
  'cli.install': { en: '1. Install the CLI', es: '1. Instala el CLI' },
  'cli.installInfo': {
    en: 'Run in your project with Node.js 24+ and pnpm. This installs CLI 0.1.0 from the verified GitHub release as a development dependency.',
    es: 'Ejecuta en tu proyecto con Node.js 24+ y pnpm. Instala el CLI 0.1.0 desde la release de GitHub como dependencia de desarrollo.',
  },
  'cli.release': { en: 'Release & checksums', es: 'Release y checksums' },
  'cli.manifest': { en: '2. Declare your skills', es: '2. Declara tus skills' },
  'cli.manifestInfo': {
    en: 'init creates agent.json without overwriting an existing file. Add published skill slugs and exact versions. The names below are illustrative; replace them with skills available in the catalogue.',
    es: 'init crea agent.json sin sobrescribir uno existente. Añade slugs publicados y versiones exactas. Los nombres del ejemplo son ilustrativos: sustitúyelos por skills disponibles en el catálogo.',
  },
  'cli.fields': {
    en: 'schemaVersion is 1. skills maps each published slug to an exact major.minor.patch version. Ranges and latest are rejected. An optional registry must be HTTPS; the default is AgentRepo.',
    es: 'schemaVersion es 1. skills relaciona cada slug publicado con una versión exacta major.minor.patch. No se admiten rangos ni latest. registry es opcional y debe ser HTTPS; por defecto se usa AgentRepo.',
  },
  'cli.run': {
    en: '3. Choose your tool and install',
    es: '3. Elige tu herramienta e instala',
  },
  'cli.runInfo': {
    en: 'The installer asks which tool you use. Press Enter for the portable fallback, or pass --target. Noninteractive terminals use the fallback automatically.',
    es: 'El instalador pregunta qué herramienta utilizas. Pulsa Enter para el fallback portátil o usa --target. Las terminales no interactivas usan el fallback automáticamente.',
  },
  'cli.target': { en: 'Target', es: 'Target' },
  'cli.folder': { en: 'Project folder', es: 'Carpeta del proyecto' },
  'cli.fallback': { en: 'Portable fallback', es: 'Fallback portátil' },
  'cli.lock': { en: '4. Verify and reproduce', es: '4. Verifica y reproduce' },
  'cli.lockInfo': {
    en: 'Commit agent.json and agent-lock.json. Ignore .agentrepo/, which stores local installation state. verify checks content and permissions; frozen installs require the existing lock and never rewrite it.',
    es: 'Guarda agent.json y agent-lock.json en Git. Ignora .agentrepo/, que contiene el estado local. verify comprueba contenido y permisos; una instalación frozen exige el lock existente y no lo reescribe.',
  },
  'cli.snapshots': {
    en: 'Fixed versions. Read-only snapshots.',
    es: 'Versiones fijas. Snapshots de solo lectura.',
  },
  'cli.snapshotInfo': {
    en: 'Each skill is a SKILL.md snapshot with SHA-256 integrity pinned in agent-lock.json. On POSIX systems the file and its directory block ordinary writes. To customize, publish a new version or slug; to upgrade, change agent.json and install again.',
    es: 'Cada skill es un snapshot SKILL.md con integridad SHA-256 fijada en agent-lock.json. En sistemas POSIX, el archivo y su carpeta bloquean escrituras ordinarias. Para personalizar, publica una versión o slug nuevos; para actualizar, cambia agent.json e instala de nuevo.',
  },
  'cli.restore': {
    en: 'install restores altered managed snapshots. If a server changes an already locked version, installation stops and preserves the previous files. The CLI never executes downloaded skill content.',
    es: 'install restaura snapshots gestionados alterados. Si el servidor cambia una versión ya fijada, la instalación se detiene y conserva los archivos anteriores. El CLI no ejecuta el contenido descargado.',
  },
  'cli.limits': {
    en: 'Read-only permissions are not a security boundary against an owner who changes permissions, root or a compromised machine. Windows permissions differ. Hashes are not publisher signatures, and verification is not continuous: run verify before use. Review new skills before trusting their instructions.',
    es: 'Solo lectura no es una barrera frente al propietario que cambie permisos, root o un equipo comprometido. Los permisos de Windows difieren. Los hashes no son firmas del editor y la verificación no es continua: ejecuta verify antes de usar las skills. Revisa las instrucciones de skills nuevas antes de confiar en ellas.',
  },
  'cli.docs': {
    en: 'Full CLI documentation',
    es: 'Documentación completa del CLI',
  },
  'cli.copy': { en: 'Copy', es: 'Copiar' },
  'cli.copied': { en: 'Copied', es: 'Copiado' },
  'cli.copyFailed': {
    en: 'Select and copy manually',
    es: 'Selecciona y copia manualmente',
  },
  'cli.scope': {
    en: 'The CLI installs catalogue skills. Agent project guides are documentation, not installers for upstream agent runtimes.',
    es: 'El CLI instala skills del catálogo. Las guías de proyectos de agentes son documentación, no instaladores de sus runtimes.',
  },
  'nav.playground': { en: 'Playground', es: 'Playground' },
  'nav.portfolio': { en: 'Portfolio', es: 'Portfolio' },
  'nav.search': { en: 'Search', es: 'Buscar' },
  'nav.hire': { en: 'Creator', es: 'Creador' },
  'nav.signIn': { en: 'Sign in', es: 'Entrar' },
  'nav.openMenu': { en: 'Open menu', es: 'Abrir menú' },
  'nav.closeMenu': { en: 'Close menu', es: 'Cerrar menú' },

  'hero.titleLead': { en: 'Less noise,', es: 'Menos ruido,' },
  'hero.titleAccent': { en: 'filter better', es: 'filtra mejor' },
  'hero.subtitle': {
    en: 'Curated skills, agents and notes for building with AI — no fluff, ready to copy into your own stack.',
    es: 'Skills, agentes y notas seleccionadas para construir con IA — sin paja, listas para copiar a tu stack.',
  },
  'hero.searchPlaceholder': {
    en: 'Search skills, agents and blog posts…',
    es: 'Busca skills, agentes y artículos…',
  },

  'latest.title': { en: 'Latest', es: 'Lo último' },
  'latest.tagline': { en: 'fresh from the repo', es: 'recién salido del repo' },
  'latest.empty.title': { en: 'Nothing here yet', es: 'Aún no hay nada aquí' },
  'latest.empty.body': {
    en: 'The first skills, agents and posts are on their way. Come back soon.',
    es: 'Las primeras skills, agentes y artículos están en camino. Vuelve pronto.',
  },

  'skills.title': { en: 'Skills', es: 'Skills' },
  'skills.subtitle': {
    en: 'Reusable prompts, system instructions, configs and templates — ready to copy into your own agents.',
    es: 'Prompts, instrucciones de sistema, configs y plantillas reutilizables — listas para copiar a tus agentes.',
  },
  'skills.back': { en: '← Back to skills', es: '← Volver a skills' },
  'agents.title': { en: 'Agents', es: 'Agentes' },
  'agents.subtitle': {
    en: 'Agent projects with their repository, installation guide and configuration, ready to explore.',
    es: 'Proyectos de agentes con su repositorio, guía de instalación y configuración, listos para explorar.',
  },
  'agents.back': { en: '← Back to agents', es: '← Volver a agentes' },
  'blog.title': { en: 'Blog', es: 'Blog' },
  'blog.subtitle': {
    en: 'Notes on AI agents, clean coding and development workflows.',
    es: 'Notas sobre agentes de IA, clean code y flujos de desarrollo.',
  },
  'blog.back': { en: '← Back to blog', es: '← Volver al blog' },
  'blog.readPost': { en: 'Read post →', es: 'Leer artículo →' },

  'playground.eyebrow': { en: 'Agent Playground', es: 'Agent Playground' },
  'playground.title': {
    en: 'A Kanban board where agents work live',
    es: 'Una pizarra Kanban donde los agentes trabajan en directo',
  },
  'playground.subtitle': {
    en: 'Drag tasks through coding and tests, connect a documentation library, add screenshots and merge. Select one or more finished cards for a simulated batch release.',
    es: 'Arrastra tareas por desarrollo y pruebas, conecta una librería de documentación, añade capturas y mergea. Selecciona una o varias tarjetas finalizadas para simular un release en lote.',
  },
  'playground.guidedSimulation': {
    en: 'Guided simulation',
    es: 'Simulación guiada',
  },
  'playground.restart': { en: 'Restart', es: 'Reiniciar' },
  'playground.startTask': { en: 'Start task', es: 'Iniciar tarea' },
  'playground.viewPreview': { en: 'View preview', es: 'Ver previsualización' },
  'playground.deploy': { en: 'Deploy', es: 'Deploy' },
  'playground.deploying': {
    en: 'Deploying to Spaceship...',
    es: 'Desplegando en Spaceship...',
  },
  'playground.deploySuccess': { en: 'Deploy successful', es: 'Deploy exitoso' },
  'playground.openChat': {
    en: 'Open assistant chat',
    es: 'Abrir chat del asistente',
  },
  'playground.assistantReady': { en: 'Assistant ready', es: 'Asistente listo' },
  'playground.chatTitle': {
    en: 'Assistant chat',
    es: 'Chat del asistente',
  },
  'playground.assistant': { en: 'Assistant', es: 'Asistente' },
  'playground.clearChat': {
    en: 'Clear conversation',
    es: 'Vaciar conversación',
  },
  'playground.closeChat': { en: 'Close chat', es: 'Cerrar chat' },
  'playground.emptyChatHint': {
    en: 'Drag a task onto the board to have the assistant start narrating.',
    es: 'Arrastra una tarea al tablero para que el asistente empiece a narrar.',
  },
  'playground.previewOf': {
    en: 'Preview of',
    es: 'Previsualización de',
  },
  'playground.closePreview': {
    en: 'Close preview',
    es: 'Cerrar previsualización',
  },
  'playground.copyCode': { en: 'Copy code', es: 'Copiar código' },
  'playground.assertionFailed': {
    en: 'Assertion failed in the test suite',
    es: 'La aserción de seguridad ha fallado en la suite de tests',
  },
  'playground.column.backlog': { en: 'Backlog', es: 'Backlog' },
  'playground.column.develop': { en: 'Develop', es: 'Desarrollar' },
  'playground.column.testing': { en: 'Testing', es: 'Testing' },
  'playground.column.review': { en: 'Review', es: 'Review' },
  'playground.column.documentation': {
    en: 'Documentation',
    es: 'Documentación',
  },
  'playground.documentationLibrary': {
    en: 'Documentation library',
    es: 'Librería de documentación',
  },
  'playground.document': {
    en: 'Document and merge',
    es: 'Documentar y mergear',
  },
  'playground.connectedTo': { en: 'Connected to', es: 'Conectada a' },
  'playground.screenshots': { en: 'screenshots', es: 'capturas' },
  'playground.merged': {
    en: 'Documented and merged',
    es: 'Documentada y mergeada',
  },
  'playground.selectForRelease': {
    en: 'Select for release',
    es: 'Seleccionar para release',
  },
  'playground.releaseTitle': {
    en: 'Batch release simulation',
    es: 'Simulación de release en lote',
  },
  'playground.releaseDescription': {
    en: 'Select completed cards, then simulate one Git tag and one deployment for the batch.',
    es: 'Selecciona tarjetas finalizadas y simula un único tag de Git y un despliegue para el lote.',
  },
  'playground.cardsSelected': {
    en: 'cards selected',
    es: 'tarjetas seleccionadas',
  },
  'playground.deploySelected': {
    en: 'Tag and deploy selection',
    es: 'Etiquetar y desplegar selección',
  },
  'playground.mock.documenting': {
    en: 'DocsAgent connects the library, adds screenshots, writes the guide and merges the PR.',
    es: 'DocsAgent conecta la librería, añade capturas, redacta la guía y mergea la PR.',
  },
  'playground.mock.documented': {
    en: 'Documented and merged. Select this card for the next batch release.',
    es: 'Documentada y mergeada. Selecciona la tarjeta para el siguiente release en lote.',
  },
  'playground.mock.intro': {
    en: 'Hi! Drag one of the Backlog tasks into "Develop" to watch my sub-agents get to work.',
    es: '¡Hola! Arrastra una de las tareas del Backlog a "Desarrollar" para ver cómo mis subagentes se ponen a trabajar.',
  },
  'playground.mock.coderStart': {
    en: 'CoderAgent taking the task. Writing code and components...',
    es: 'CoderAgent asumiendo la tarea. Escribiendo código y componentes...',
  },
  'playground.mock.testerRunning': {
    en: 'TesterAgent running the integration suite...',
    es: 'TesterAgent corriendo la suite de integración...',
  },
  'playground.mock.testFailed': {
    en: 'Oops! The security assertion failed. Sending it back to the Coder to fix the bug...',
    es: '¡Ups! La aserción de seguridad ha fallado. Reenviando al Coder para refinar el bug...',
  },
  'playground.mock.testFailedDetail': {
    en: 'Security assertion failed',
    es: 'La aserción de seguridad ha fallado',
  },
  'playground.mock.retesting': {
    en: 'Bug fixed. TesterAgent retrying the suite...',
    es: 'Bug refinado. TesterAgent reintentando la suite...',
  },
  'playground.mock.readyForReview': {
    en: '✓ Tests passed. Preview the feature in Review, then document and merge it.',
    es: '✓ Tests superados. Previsualiza la feature en Review, después documéntala y mergea.',
  },
  'playground.mock.deploySuccess': {
    en: 'Batch release simulated: one tag and deployment for the selected cards. 🎉',
    es: 'Release en lote simulado: un tag y despliegue para las tarjetas seleccionadas. 🎉',
  },

  'common.empty': {
    en: 'Nothing published yet. Come back soon.',
    es: 'Aún no hay nada publicado. Vuelve pronto.',
  },
  'common.updated': { en: 'Updated', es: 'Actualizado' },
  'common.demoIncluded': { en: 'Demo included', es: 'Incluye demo' },

  'premium.badge': { en: 'Premium', es: 'Premium' },
  'premium.locked.title': {
    en: 'This is a premium asset',
    es: 'Este es un contenido premium',
  },
  'premium.locked.body': {
    en: 'Buy once and get full access to the complete content, forever.',
    es: 'Cómpralo una vez y accede al contenido completo, para siempre.',
  },
  'premium.buy': { en: 'Buy access', es: 'Comprar acceso' },
  'premium.checkoutSoon': {
    en: 'Checkout is almost ready — sign in with GitHub or Google will be required.',
    es: 'El pago estará disponible muy pronto — requerirá iniciar sesión con GitHub o Google.',
  },
  'premium.preview': { en: 'Preview', es: 'Vista previa' },

  'palette.placeholder': {
    en: 'Search skills, agents and blog posts…',
    es: 'Busca skills, agentes y artículos…',
  },
  'palette.hint': {
    en: 'Type at least 2 characters to search the whole site.',
    es: 'Escribe al menos 2 caracteres para buscar en todo el sitio.',
  },
  'palette.noResults': { en: 'No results for', es: 'Sin resultados para' },
  'palette.avatarHint': {
    en: 'Here you can search skills, agents or the latest news.',
    es: 'Aquí puedes buscar skills, agentes o las últimas noticias.',
  },
  'avatar.easterEgg.surprise': {
    en: 'Oh! Looks like you found something… keep clicking.',
    es: 'Vaya, parece que has descubierto algo… sigue haciendo click.',
  },
  'palette.navigate': { en: '↑↓ navigate', es: '↑↓ navegar' },
  'palette.open': { en: '↵ open', es: '↵ abrir' },
  'palette.close': { en: 'esc close', es: 'esc cerrar' },

  'footer.tagline': {
    en: 'Less noise, filter better.',
    es: 'Menos ruido, filtra mejor.',
  },

  'auth.title': { en: 'Join the community', es: 'Únete a la comunidad' },
  'auth.subtitle': {
    en: 'Sign in to buy premium assets and keep your library in sync.',
    es: 'Inicia sesión para comprar contenido premium y sincronizar tu biblioteca.',
  },
  'auth.continueGithub': {
    en: 'Continue with GitHub',
    es: 'Continuar con GitHub',
  },
  'auth.continueGoogle': {
    en: 'Continue with Google',
    es: 'Continuar con Google',
  },
  'auth.continueApple': {
    en: 'Continue with Apple',
    es: 'Continuar con Apple',
  },
  'auth.emailToggle': {
    en: 'Or use email and password',
    es: 'O usa email y contraseña',
  },
  'auth.email': { en: 'Email', es: 'Email' },
  'auth.password': { en: 'Password', es: 'Contraseña' },
  'auth.signIn': { en: 'Sign in', es: 'Entrar' },
  'auth.notConfigured': {
    en: 'Authentication is not configured in this environment yet (missing Supabase keys).',
    es: 'La autenticación aún no está configurada en este entorno (faltan las claves de Supabase).',
  },

  'portfolio.back': { en: 'Back to the repo', es: 'Volver al repositorio' },
  'portfolio.hero.tags': {
    en: 'agentic workflows · LLM orchestration · RAG',
    es: 'flujos agénticos · orquestación de LLM · RAG',
  },
  'portfolio.experience.title': {
    en: 'Professional journey',
    es: 'Trayectoria profesional',
  },
  'portfolio.capabilities.title': { en: 'What I bring', es: 'Lo que aporto' },
  'portfolio.contact.title': { en: "Let's talk", es: 'Hablemos' },
  'portfolio.contact.agentNotice': {
    en: 'This form is analysed autonomously by an <strong>AI Agent</strong>. On submit, the agent processes your message, builds an interactive technical PDF report and replies to you by email instantly.',
    es: 'Este formulario es analizado autónomamente por un <strong>Agente IA</strong>. Al enviarlo, el agente procesará tu mensaje, creará un reporte técnico interactivo en PDF y te responderá por email al instante.',
  },
  'portfolio.contact.sentTitle': {
    en: 'Message received! ✦',
    es: '¡Mensaje recibido! ✦',
  },
  'portfolio.contact.sentBody': {
    en: 'The AI Agent has started the analysis. You will get an interactive email soon.',
    es: 'El Agente IA ha comenzado el análisis. Recibirás un email interactivo pronto.',
  },
  'portfolio.contact.email': { en: 'Email', es: 'Email' },
  'portfolio.contact.subject': { en: 'Subject', es: 'Asunto' },
  'portfolio.contact.message': { en: 'Message', es: 'Mensaje' },
  'portfolio.contact.messagePlaceholder': {
    en: 'Tell me about your project, your stack and what you need…',
    es: 'Cuéntame sobre tu proyecto, tu stack y lo que necesitas…',
  },
  'portfolio.contact.subject.employment': { en: 'Employment', es: 'Empleo' },
  'portfolio.contact.subject.freelance': { en: 'Freelance', es: 'Freelance' },
  'portfolio.contact.subject.question': {
    en: 'Technical question',
    es: 'Consulta técnica',
  },
  'portfolio.contact.subject.other': { en: 'Other', es: 'Otro' },
  'portfolio.contact.error.emailRequired': {
    en: 'Your email is required',
    es: 'Tu email es obligatorio',
  },
  'portfolio.contact.error.emailInvalid': {
    en: 'Enter a valid email',
    es: 'Introduce un email válido',
  },
  'portfolio.contact.error.messageRequired': {
    en: 'Tell me at least a little about your project',
    es: 'Cuéntame al menos un poco sobre tu proyecto',
  },
  'portfolio.contact.error.messageMin': {
    en: 'The message must be at least 20 characters',
    es: 'El mensaje debe tener al menos 20 caracteres',
  },
  'portfolio.contact.error.submit': {
    en: 'The message could not be sent. Try again in a few minutes.',
    es: 'No se pudo enviar el mensaje. Inténtalo de nuevo en unos minutos.',
  },
  'portfolio.contact.submit': {
    en: 'Send to the agent',
    es: 'Enviar al agente',
  },
  'portfolio.contact.submitting': { en: 'Processing…', es: 'Procesando…' },
} satisfies Dictionary<string>;

export type WebDictionaryKey = keyof typeof webDictionary;
