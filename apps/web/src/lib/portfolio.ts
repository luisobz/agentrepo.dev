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
  location: string;
  linkedinUrl: string;
  manifesto: string[];
  experience: ExperienceEntry[];
  capabilities: Capability[];
}

const LUISBZ: PortfolioProfile = {
  slug: 'luisbz',
  name: 'Luis Ballester Zafra',
  role: 'Senior Full-Stack Engineer & Tech Lead · AI Platform Builder',
  headline: 'Valencia, Spain · 8+ years shipping products',
  location: 'Valencia, Spain',
  linkedinUrl: 'https://linkedin.com/in/luisbz/',
  manifesto: [
    'Senior Full-Stack Engineer & Tech Lead with 8+ years building scalable digital products from scratch. The past 2 years focused on AI platforms, agentic workflows and LLM orchestration: RAG pipelines, automated content generation and AI-powered lead intelligence.',
    'I seek complex problems and full product ownership — and I enjoy making teams faster: internal tools, reusable libraries, NPM packages, scaffolding templates and AI utilities. Direct teams, high standards, genuine commitment.',
  ],
  experience: [
    {
      period: 'Mar 2022 — May 2026',
      role: 'Senior Full-Stack Developer & Tech Lead',
      company: 'Dekalabs',
      achievement:
        'Architected an end-to-end AI generation platform for personalised landing pages and marketing content per lead, cutting production time from months to 1–2 weeks. Typed LLM pipelines (Zod + JSON Schema as output contracts with retries and fallbacks), RAG context-injection, AI lead scoring from voice and chat, Replicate image generation, BullMQ async orchestration, SSO via AWS Cognito and a Web3 SDK suite (gasless transactions, ERC20/721/1155). Led cross-functional teams and technical discovery for clients in New York, Switzerland and France.',
    },
    {
      period: 'Mar 2020 — Mar 2022',
      role: 'Senior Full-Stack Developer (Java & Vue.js)',
      company: 'Prodevelop',
      achievement:
        'Port terminal management for vessel discharge and cargo logistics: a new timeslot scheduling module increased truck loading efficiency by 100%. Refactored a mission-critical legacy billing microservice, significantly increasing processing speed and unlocking modular billing features. Contributed to the company framework and mentored junior developers.',
    },
    {
      period: 'Apr 2019 — Mar 2020',
      role: 'Full-Stack Developer',
      company: 'Prodevelop',
      achievement:
        'Designed and built the first web applications for port operations management from scratch, focused on real-time data visualisation and database performance (Java/Spring Boot, Vue.js, PostgreSQL, Oracle).',
    },
    {
      period: 'Mar 2018 — Apr 2019',
      role: 'Full-Stack Developer',
      company: 'Indra',
      achievement:
        'Developed and maintained features for Public Administration projects with Java on the backend and PHP on the frontend.',
    },
  ],
  capabilities: [
    {
      key: 'ai',
      title: 'AI & Agentic Orchestration',
      description:
        'LLM systems with contracts: typed outputs, retries, evaluation and tracing.',
      technologies: [
        'Claude / OpenAI / Replicate',
        'RAG',
        'Agentic workflows',
        'Function calling',
        'Structured generation',
        'BullMQ pipelines',
      ],
    },
    {
      key: 'backend',
      title: 'Robust Backend & Cloud',
      description:
        'Microservices and APIs built to be operated: typed, tested, observable.',
      technologies: [
        'Node.js (NestJS, Fastify)',
        'Java (Spring Boot)',
        'Python (Django)',
        'PostgreSQL · MongoDB · Redis',
        'AWS (Cognito, Lambda, S3, EC2)',
        'GCP · Terraform · Docker',
      ],
    },
    {
      key: 'ui',
      title: 'Frontend & Product',
      description:
        'Interfaces with intent, from design system to OAuth flows.',
      technologies: [
        'React',
        'Vue.js',
        'TypeScript',
        'Refine.dev',
        'OAuth / SSO',
        'WebSockets · Web3',
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
