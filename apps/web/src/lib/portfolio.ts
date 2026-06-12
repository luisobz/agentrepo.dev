/** Static content for the (hidden) personal portfolio pages, keyed by slug. */

export interface ExperienceEntry {
  period: string;
  role: string;
  company: string;
  achievement: string;
}

export interface Capability {
  key: 'ai' | 'backend' | 'ui';
  title: string;
  description: string;
  technologies: string[];
}

export interface PortfolioProfile {
  slug: string;
  name: string;
  role: string;
  headline: string;
  manifesto: string[];
  experience: ExperienceEntry[];
  capabilities: Capability[];
}

const LUISBZ: PortfolioProfile = {
  slug: 'luisbz',
  name: 'Luisbz',
  role: 'AI Engineer & Senior Fullstack Developer',
  headline: 'I build agents that ship.',
  manifesto: [
    'Autonomous agents are only useful when they are accountable: validated inputs, hexagonal boundaries and observable pipelines — or it does not go to production.',
    'I design LLM systems the same way I design backends: small contracts, strict types and tests first. The model is just another adapter.',
  ],
  experience: [
    {
      period: '2024 — Now',
      role: 'AI Engineer',
      company: 'AgentRepo.dev',
      achievement:
        'Designed an autonomous contact-triage agent and a multi-step content pipeline; cut manual review time by 60% while keeping every LLM call traced in Langfuse.',
    },
    {
      period: '2021 — 2024',
      role: 'Senior Fullstack Developer',
      company: 'Nexa Labs',
      achievement:
        'Led the migration of a legacy monolith to a hexagonal Nx monorepo (NestJS + tRPC + Prisma); production incidents dropped 40% and median deploy time fell from 45 to 8 minutes.',
    },
    {
      period: '2019 — 2021',
      role: 'Fullstack Developer',
      company: 'Bluekite Studio',
      achievement:
        'Shipped a multi-tenant SaaS dashboard used by 30k monthly users at 99.9% uptime; introduced typed API contracts that removed an entire class of runtime errors.',
    },
    {
      period: '2017 — 2019',
      role: 'Frontend Developer',
      company: 'Studio K',
      achievement:
        'Built a reusable component library adopted across 6 client projects, halving the average time-to-first-prototype.',
    },
  ],
  capabilities: [
    {
      key: 'ai',
      title: 'AI & Agentic Orchestration',
      description:
        'Agents with guardrails: structured outputs, evaluation loops and full tracing.',
      technologies: [
        'LLM pipelines',
        'Agent orchestration',
        'RAG',
        'Langfuse',
        'Prompt engineering',
        'MCP',
      ],
    },
    {
      key: 'backend',
      title: 'Robust Backend',
      description:
        'Hexagonal services with strict contracts, built to be tested and operated.',
      technologies: [
        'NestJS',
        'tRPC',
        'Prisma',
        'PostgreSQL',
        'Hexagonal architecture',
        'Nx monorepo',
      ],
    },
    {
      key: 'ui',
      title: 'Premium UI/UX',
      description:
        'Interfaces with intent: design tokens, motion and accessibility by default.',
      technologies: [
        'Next.js',
        'React 19',
        'Tailwind 4',
        'Framer Motion',
        'Design systems',
        'Radix UI',
      ],
    },
  ],
};

const PROFILES: Record<string, PortfolioProfile> = {
  [LUISBZ.slug]: LUISBZ,
};

export function getPortfolioProfile(slug: string): PortfolioProfile | null {
  return PROFILES[slug] ?? null;
}
