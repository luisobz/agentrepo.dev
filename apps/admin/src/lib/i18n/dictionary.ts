import type { Dictionary } from '@agentrepo/ui';

export const adminDictionary = {
  'review.heading': {
    en: 'Contributor proposals',
    es: 'Propuestas de colaboradores',
  },
  'review.info': {
    en: 'Content remains private until you authorise publication. Review the content and links before approving.',
    es: 'El contenido permanece privado hasta que autorices su publicación. Revisa el contenido y los enlaces antes de aprobar.',
  },
  'review.error': {
    en: 'Could not publish. The proposal remains pending.',
    es: 'No se pudo publicar. La propuesta sigue pendiente.',
  },
  'review.loading': {
    en: 'Loading proposals\u2026',
    es: 'Cargando propuestas…',
  },
  'review.empty': {
    en: 'No pending proposals.',
    es: 'No hay propuestas pendientes.',
  },
  'review.author': { en: 'Author', es: 'Autoría' },
  'review.contributor': { en: 'Contributor', es: 'Colaborador' },
  'review.edit': { en: 'Review and edit', es: 'Revisar y editar' },
  'review.approve': {
    en: 'Authorise publication',
    es: 'Autorizar publicación',
  },
  'review.publishing': { en: 'Publishing\u2026', es: 'Publicando…' },
  'review.all': { en: 'View all proposals', es: 'Ver todas las propuestas' },
  'review.loadError': {
    en: 'Could not load all proposals. Reload the page.',
    es: 'No se pudieron cargar todas las propuestas. Recarga la página.',
  },
  'review.confirm': {
    en: 'Publish this proposal with the indicated authorship?',
    es: '¿Publicar esta propuesta con la autoría indicada?',
  },

  'nav.review': { en: 'Review submissions', es: 'Revisar propuestas' },
  'nav.dashboard': { en: 'Dashboard', es: 'Panel' },
  'nav.skills': { en: 'Skills', es: 'Skills' },
  'nav.agents': { en: 'Agents', es: 'Agentes' },
  'nav.blog': { en: 'Blog', es: 'Blog' },
  'nav.contacts': { en: 'Contacts', es: 'Contactos' },
  'nav.playgroundTokens': { en: 'Playground tokens', es: 'Tokens playground' },
  'nav.signOut': { en: 'Sign out', es: 'Cerrar sesión' },
  'nav.adminPanel': { en: 'Admin panel', es: 'Panel de administración' },
  'nav.viewWebsite': { en: 'View website', es: 'Ver web' },
  'nav.navigation': { en: 'Administration', es: 'Administración' },
  'nav.openNavigation': { en: 'Open navigation', es: 'Abrir navegación' },
  'nav.closeNavigation': { en: 'Close navigation', es: 'Cerrar navegación' },

  'dashboard.title': { en: 'Dashboard', es: 'Panel' },
  'dashboard.subtitle': {
    en: 'Manage the content published on agentrepo.dev',
    es: 'Gestiona el contenido publicado en agentrepo.dev',
  },
  'dashboard.skills.desc': {
    en: 'Reusable prompts, configs and templates',
    es: 'Prompts, configs y plantillas reutilizables',
  },
  'dashboard.agents.desc': {
    en: 'Agent definitions with file trees',
    es: 'Definiciones de agentes con árboles de archivos',
  },
  'dashboard.blog.desc': {
    en: 'Articles and changelog entries',
    es: 'Artículos y entradas de changelog',
  },

  'common.search': { en: 'Search', es: 'Buscar' },
  'common.new': { en: 'New', es: 'Nuevo' },
  'common.edit': { en: 'Edit', es: 'Editar' },
  'common.delete': { en: 'Delete', es: 'Borrar' },
  'common.save': { en: 'Save changes', es: 'Guardar cambios' },
  'common.cancel': { en: 'Cancel', es: 'Cancelar' },

  'login.title': { en: 'Admin access', es: 'Acceso de administración' },
  'login.password': {
    en: 'Admin password',
    es: 'Contraseña de administración',
  },
  'login.submit': { en: 'Sign in', es: 'Entrar' },
  'login.signingIn': { en: 'Signing in…', es: 'Entrando…' },
} satisfies Dictionary<string>;

export type AdminDictionaryKey = keyof typeof adminDictionary;
