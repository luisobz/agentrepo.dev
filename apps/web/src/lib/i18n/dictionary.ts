import type { Dictionary } from '@agentrepo/ui';

export const webDictionary = {
  'contribute.skill': { en: 'Propose a skill', es: 'Proponer una skill' },
  'contribute.agent': { en: 'Propose an agent', es: 'Proponer un agente' },
  'contribute.blog': { en: 'Propose an article', es: 'Proponer un artículo' },
  'contribute.hero': {
    en: 'Have something to share?',
    es: '¿Tienes algo que compartir?',
  },
  'contribute.heroAction': {
    en: 'Propose a skill, agent or article',
    es: 'Propón una skill, un agente o un artículo',
  },
  'contribute.label': { en: 'Community', es: 'Participa' },
  'footer.privacy': { en: 'Privacy', es: 'Privacidad' },
  'footer.terms': { en: 'Terms', es: 'Condiciones' },
  'footer.donate': { en: 'Support the project', es: 'Apoyar el proyecto' },
  'footer.donateHint': {
    en: 'Voluntary support through Ko-fi (opens in a new tab)',
    es: 'Apoyo voluntario a través de Ko-fi (se abre en una pestaña nueva)',
  },
  'footer.support': { en: 'Report an issue', es: 'Comunicar un error' },
  'creator.contributionTerms': {
    en: 'Include a licence and attribution. By submitting, you confirm you may distribute these files and accept the contribution terms.',
    es: 'Incluye licencia y atribución. Al enviar confirmas que puedes distribuir estos archivos y aceptas las condiciones de contribución.',
  },
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
  'creator.uploadAgent': {
    en: 'Upload source files or a ZIP',
    es: 'Subir archivos de código o un ZIP',
  },
  'creator.packageHelp': {
    en: 'UTF-8 text sources: up to 200 files, 100 KB each and 1 MB total. ZIP up to 4 MB; folders are preserved. The editor above becomes README.md. Binary files, nested archives and links are not accepted. Exclude credentials.',
    es: 'Archivos de texto UTF-8: hasta 200 archivos, 100 KB por archivo y 1 MB en total. ZIP de hasta 4 MB; se conservan las carpetas. El editor superior será README.md. No se admiten binarios, archivos comprimidos anidados ni enlaces. Excluye credenciales.',
  },
  'creator.readingFiles': {
    en: 'Checking source files…',
    es: 'Comprobando archivos…',
  },
  'creator.files': { en: 'files', es: 'archivos' },
  'creator.packageFiles': {
    en: 'Source package files',
    es: 'Archivos del paquete',
  },
  'creator.clearFiles': { en: 'Clear files', es: 'Quitar archivos' },
  'creator.upload': {
    en: 'Or upload a Markdown file (.md or .txt)',
    es: 'O sube un fichero Markdown (.md o .txt)',
  },
  'creator.pendingHelp': {
    en: 'Submitted content stays unpublished until reviewed.',
    es: 'El contenido queda privado hasta su revisión.',
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
    en: 'Propose content',
    es: 'Proponer contenido',
  },
  'creator.pageInfo': {
    en: 'Propose a skill, agent project or article. Your account is recorded as the author and the administrator reviews each proposal before publication.',
    es: 'Propón una skill, un proyecto de agente o un artículo. Tu cuenta queda registrada como autora y el administrador revisa cada propuesta antes de publicarla.',
  },
  'creator.writerRecommendation': {
    en: 'Creating a skill or agent? We recommend',
    es: '¿Vas a crear una skill o un agente? Recomendamos',
  },
  'creator.writerBenefit': {
    en: ' to write clear instructions and documentation ready to publish.',
    es: ' para redactar instrucciones claras y documentación lista para publicar.',
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
    en: 'Add skills to your project with an interactive CLI.',
    es: 'Añade skills a tu proyecto con un CLI interactivo.',
  },
  'cli.install': { en: '1. Install the CLI', es: '1. Instala el CLI' },
  'cli.installInfo': {
    en: 'Requires Node.js 24+ and pnpm. Install once. If pnpm requests a global PATH, run pnpm setup and reopen your terminal.',
    es: 'Requiere Node.js 24+ y pnpm. Instálalo una vez. Si pnpm pide configurar el PATH global, ejecuta pnpm setup y abre otra terminal.',
  },
  'cli.launchInfo': {
    en: 'Inside your project, open the menu to choose your tool and add skills:',
    es: 'Dentro de tu proyecto, abre el menú para elegir herramienta y añadir skills:',
  },
  'cli.release': { en: 'Release & checksums', es: 'Release y checksums' },
  'cli.manifest': {
    en: 'Your project configuration',
    es: 'La configuración de tu proyecto',
  },
  'cli.manifestInfo': {
    en: 'agent.json records your tool and the skills installed in this project. The CLI creates and updates it for you. Example:',
    es: 'agent.json guarda tu herramienta y las skills instaladas en este proyecto. El CLI lo crea y actualiza por ti. Ejemplo:',
  },
  'cli.fields': {
    en: 'target chooses the folder; locale selects the skill language, with fallback to the original. The lock pins the resolved language. skills maps names to exact versions. The names are examples.',
    es: 'target elige la carpeta; locale selecciona el idioma de las skills, con fallback al original. El lock fija el idioma utilizado. skills relaciona nombres con versiones exactas. Los nombres son ejemplos.',
  },
  'cli.run': {
    en: 'Short commands, when you need them',
    es: 'Comandos cortos, cuando los necesites',
  },
  'cli.runInfo': {
    en: 'Use a published skill name instead of skill2. Its latest version is selected automatically; @latest is optional. For a specific version, use skill2@1.0.0.',
    es: 'Sustituye skill2 por el nombre de una skill publicada. Se elige la última versión automáticamente; @latest es opcional. Para una versión concreta, usa skill2@1.0.0.',
  },
  'cli.target': { en: 'Target', es: 'Target' },
  'cli.folder': { en: 'Project folder', es: 'Carpeta del proyecto' },
  'cli.fallback': { en: 'Portable fallback', es: 'Fallback portátil' },
  'cli.lock': { en: 'Reproducible by default', es: 'Reproducible por defecto' },
  'cli.lockInfo': {
    en: 'Commit agent.json and agent-lock.json to keep the same versions across installations. Add .agentrepo/ to .gitignore.',
    es: 'Guarda agent.json y agent-lock.json en Git para repetir la instalación con las mismas versiones. Añade .agentrepo/ a .gitignore.',
  },
  'cli.snapshots': {
    en: 'Read-only skills',
    es: 'Skills de solo lectura',
  },
  'cli.snapshotInfo': {
    en: 'Skills are installed read-only and checked against SHA-256 hashes. verify detects changes; reset --hard restores them without deleting your project files.',
    es: 'Las skills se instalan en modo solo lectura y se comprueban con hashes SHA-256. verify detecta cambios; reset --hard las restaura sin borrar archivos del proyecto.',
  },
  'cli.restore': {
    en: 'install restores altered managed snapshots. If a server changes an already locked version, installation stops and preserves the previous files. The CLI never executes downloaded skill content.',
    es: 'install restaura snapshots gestionados alterados. Si el servidor cambia una versión ya fijada, la instalación se detiene y conserva los archivos anteriores. El CLI no ejecuta el contenido descargado.',
  },
  'cli.limits': {
    en: 'Read-only permissions do not prevent changes by the owner or root. Hashes check integrity, not authorship. Review new skills before use.',
    es: 'Los permisos de solo lectura no impiden cambios del propietario o root. Los hashes comprueban integridad, no autoría. Revisa las skills nuevas antes de usarlas.',
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
  'nav.hire': { en: 'Contribute', es: 'Proponer contenido' },
  'nav.signIn': { en: 'Sign in', es: 'Entrar' },
  'nav.openMenu': { en: 'Open menu', es: 'Abrir menú' },
  'nav.closeMenu': { en: 'Close menu', es: 'Cerrar menú' },

  'hero.titleLead': { en: 'Less noise,', es: 'Menos ruido,' },
  'hero.titleAccent': { en: 'filter better', es: 'más útil' },
  'hero.subtitle': {
    en: 'Curated skills, agents and articles for building with AI.',
    es: 'Skills, agentes y artículos seleccionados para construir con IA.',
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
    en: 'Reusable prompts, system instructions, configs and templates for your AI agents.',
    es: 'Prompts, instrucciones de sistema, configuraciones y plantillas reutilizables para tus agentes de IA.',
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
    en: 'Checkout is almost ready. Signing in with GitHub or Google will be required.',
    es: 'El pago estará disponible muy pronto. Requerirá iniciar sesión con GitHub o Google.',
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
    es: 'Menos ruido, más útil.',
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
