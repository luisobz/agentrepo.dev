import type { Dictionary } from '@agentrepo/ui';

export const webDictionary = {
  'nav.skills': { en: 'Skills', es: 'Skills' },
  'nav.agents': { en: 'Agents', es: 'Agents' },
  'nav.blog': { en: 'Blog', es: 'Blog' },
  'nav.playground': { en: 'Playground', es: 'Playground' },
  'nav.portfolio': { en: 'Portfolio', es: 'Portfolio' },
  'nav.search': { en: 'Search', es: 'Buscar' },
  'nav.hire': { en: 'Creator', es: 'Creador' },
  'nav.signIn': { en: 'Sign in', es: 'Entrar' },

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
    en: 'Complete agent definitions you can browse file by file, like in an IDE.',
    es: 'Definiciones completas de agentes que puedes explorar archivo a archivo, como en un IDE.',
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
    en: 'Drag a task and watch the sub-agents code, test (and get it wrong, and fix it) until it ships. Hit "Restart" to run the simulation again whenever you like.',
    es: 'Arrastra una tarea y observa cómo los subagentes programan, testean (y se equivocan, y se corrigen) hasta desplegarla. Pulsa «Reiniciar» para volver a empezar la simulación cuando quieras.',
  },
  'playground.guidedSimulation': {
    en: 'Guided simulation',
    es: 'Simulación guiada',
  },
  'playground.restart': { en: 'Restart', es: 'Reiniciar' },
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
  'playground.column.deploy': { en: 'Deploy', es: 'Deploy' },
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
    en: '✓ Tests passed. The feature is waiting for your approval in Review: preview it and deploy it.',
    es: '✓ Tests passed. La feature espera tu visto bueno en Review: previsualízala y despliégala.',
  },
  'playground.mock.deploySuccess': {
    en: 'Deploy successful! The feature is now live in production. 🎉',
    es: '¡Deploy exitoso! La feature ya está en producción. 🎉',
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
  'auth.continueGithub': { en: 'Continue with GitHub', es: 'Continuar con GitHub' },
  'auth.continueGoogle': { en: 'Continue with Google', es: 'Continuar con Google' },
  'auth.continueApple': { en: 'Continue with Apple', es: 'Continuar con Apple' },
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
  'portfolio.contact.submit': { en: 'Send to the agent', es: 'Enviar al agente' },
  'portfolio.contact.submitting': { en: 'Processing…', es: 'Procesando…' },
} satisfies Dictionary<string>;

export type WebDictionaryKey = keyof typeof webDictionary;
