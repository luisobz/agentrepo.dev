import type { Dictionary } from '@agentrepo/ui';

export const webDictionary = {
  'nav.skills': { en: 'Skills', es: 'Skills' },
  'nav.agents': { en: 'Agents', es: 'Agentes' },
  'nav.blog': { en: 'Blog', es: 'Blog' },
  'nav.portfolio': { en: 'Portfolio', es: 'Portfolio' },
  'nav.search': { en: 'Search', es: 'Buscar' },
  'nav.hire': { en: 'Hire Luis', es: 'Contrata a Luis' },
  'nav.signIn': { en: 'Sign in', es: 'Entrar' },

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
  'palette.navigate': { en: '↑↓ navigate', es: '↑↓ navegar' },
  'palette.open': { en: '↵ open', es: '↵ abrir' },
  'palette.close': { en: 'esc close', es: 'esc cerrar' },

  'footer.tagline': {
    en: 'Less noise, more signal.',
    es: 'Menos ruido, más señal.',
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
} satisfies Dictionary<string>;

export type WebDictionaryKey = keyof typeof webDictionary;
