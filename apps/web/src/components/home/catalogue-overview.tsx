import Link from '../localized-link';
import { getServerLocale } from '../../lib/i18n/server';

const copy = {
  en: {
    title: 'Explore AgentRepo.dev',
    body: 'AgentRepo.dev is a catalogue of reusable AI skills, agent projects and engineering guides for writing, software development, testing and automation.',
    links: [
      [
        'Skills',
        'Read prompts, instructions and templates before downloading them.',
        '/skills',
      ],
      ['Agents', 'Explore agent projects, their guides and files.', '/agents'],
      [
        'Blog',
        'Learn from practical articles on development, infrastructure and security.',
        '/blog',
      ],
      [
        'CLI',
        'Install skills and pin their versions in your project’s agent.json.',
        '/cli',
      ],
    ],
  },
  es: {
    title: 'Explora AgentRepo.dev',
    body: 'AgentRepo.dev es un catálogo de skills de IA reutilizables, proyectos de agentes y guías de ingeniería para redacción, desarrollo de software, pruebas y automatización.',
    links: [
      [
        'Skills',
        'Consulta prompts, instrucciones y plantillas antes de descargarlos.',
        '/skills',
      ],
      [
        'Agentes',
        'Explora proyectos de agentes, sus guías y ficheros.',
        '/agents',
      ],
      [
        'Blog',
        'Aprende con artículos prácticos de desarrollo, infraestructura y seguridad.',
        '/blog',
      ],
      [
        'CLI',
        'Instala skills y fija sus versiones en el agent.json de tu proyecto.',
        '/cli',
      ],
    ],
  },
};

export async function CatalogueOverview() {
  const content = copy[await getServerLocale()];
  return (
    <section aria-labelledby="catalogue-heading" className="mb-14">
      <h2
        id="catalogue-heading"
        className="text-2xl font-semibold tracking-tight"
      >
        {content.title}
      </h2>
      <p className="mt-3 max-w-3xl text-[var(--color-text-secondary)]">
        {content.body}
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.links.map(([title, description, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-warm-white)] p-5 hover:border-[var(--color-brand-garnet)]"
          >
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
