import { SITE_URL } from './public-site';

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function homeStructuredData(locale: 'en' | 'es') {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'AgentRepo.dev',
        url: SITE_URL,
        inLanguage: ['en', 'es'],
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_URL}/#application`,
        name: 'AgentRepo.dev',
        url: SITE_URL,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Any',
        inLanguage: ['en', 'es'],
        description:
          locale === 'es'
            ? 'Catálogo de skills de IA reutilizables, proyectos de agentes y guías prácticas. Consulta los ficheros e instala versiones concretas con el CLI de AgentRepo.'
            : 'A catalogue of reusable AI skills, agent projects and practical guides. Preview files and install specific skill versions with the AgentRepo CLI.',
      },
    ],
  };
}
