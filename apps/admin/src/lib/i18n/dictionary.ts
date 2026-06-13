import type { Dictionary } from '@agentrepo/ui';

export const adminDictionary = {
  'nav.dashboard': { en: 'Dashboard', es: 'Panel' },
  'nav.skills': { en: 'Skills', es: 'Skills' },
  'nav.agents': { en: 'Agents', es: 'Agentes' },
  'nav.blog': { en: 'Blog', es: 'Blog' },
  'nav.signOut': { en: 'Sign out', es: 'Cerrar sesión' },
  'nav.adminPanel': { en: 'Admin panel', es: 'Panel de administración' },

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
  'login.password': { en: 'Admin password', es: 'Contraseña de administración' },
  'login.submit': { en: 'Sign in', es: 'Entrar' },
  'login.signingIn': { en: 'Signing in…', es: 'Entrando…' },
} satisfies Dictionary<string>;

export type AdminDictionaryKey = keyof typeof adminDictionary;
