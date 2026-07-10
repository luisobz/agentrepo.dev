/** Static content for the (hidden) personal portfolio pages, keyed by slug. */

import type { Locale } from '@agentrepo/ui';

/** A piece of copy available in every supported locale. */
export type LocalizedText = { en: string; es: string };

// --- Localized (source) shapes ------------------------------------------------

export interface LocalizedExperienceEntry {
  /** Dates are locale-neutral. */
  period: string;
  role: LocalizedText;
  company: string;
  achievement: LocalizedText;
}

export interface LocalizedCapability {
  key: 'ai' | 'backend' | 'ui';
  title: LocalizedText;
  description: LocalizedText;
  /** Technology names are kept as-is across locales. */
  technologies: string[];
}

export interface LocalizedPortfolioProfile {
  slug: string;
  name: string;
  role: LocalizedText;
  headline: LocalizedText;
  location: string;
  linkedinUrl: string;
  manifesto: LocalizedText[];
  experience: LocalizedExperienceEntry[];
  capabilities: LocalizedCapability[];
}

// --- Resolved shapes (what the UI consumes) ----------------------------------

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

const LUISBZ: LocalizedPortfolioProfile = {
  slug: 'luisbz',
  name: 'Luis Ballester Zafra',
  role: {
    en: 'Senior Full-Stack Engineer & Tech Lead · AI Platform Builder',
    es: 'Ingeniero Full-Stack Senior y Tech Lead · Creador de Plataformas de IA',
  },
  headline: {
    en: 'Valencia, Spain · 8+ years shipping products',
    es: 'Valencia, España · 8+ años lanzando productos',
  },
  location: 'Valencia, Spain',
  linkedinUrl: 'https://linkedin.com/in/luisbz/',
  manifesto: [
    {
      en: 'Senior Full-Stack Engineer & Tech Lead with 8+ years building scalable digital products from scratch. The past 2 years focused on AI platforms, agentic workflows and LLM orchestration: RAG pipelines, automated content generation and AI-powered lead intelligence.',
      es: 'Ingeniero Full-Stack Senior y Tech Lead con más de 8 años construyendo productos digitales escalables desde cero. Los últimos 2 años centrado en plataformas de IA, flujos agénticos y orquestación de LLM: pipelines RAG, generación automática de contenido e inteligencia de leads impulsada por IA.',
    },
    {
      en: 'I seek complex problems and full product ownership — and I enjoy making teams faster: internal tools, reusable libraries, NPM packages, scaffolding templates and AI utilities. Direct teams, high standards, genuine commitment.',
      es: 'Busco problemas complejos y propiedad total del producto, y disfruto haciendo más rápidos a los equipos: herramientas internas, librerías reutilizables, paquetes NPM, plantillas de scaffolding y utilidades de IA. Equipos directos, estándares altos, compromiso genuino.',
    },
  ],
  experience: [
    {
      period: 'Mar 2022 — May 2026',
      role: {
        en: 'Senior Full-Stack Developer & Tech Lead',
        es: 'Desarrollador Full-Stack Senior y Tech Lead',
      },
      company: 'Dekalabs',
      achievement: {
        en: 'Architected an end-to-end AI generation platform for personalised landing pages and marketing content per lead, cutting production time from months to 1–2 weeks. Typed LLM pipelines (Zod + JSON Schema as output contracts with retries and fallbacks), RAG context-injection, AI lead scoring from voice and chat, Replicate image generation, BullMQ async orchestration, SSO via AWS Cognito and a Web3 SDK suite (gasless transactions, ERC20/721/1155). Led cross-functional teams and technical discovery for clients in New York, Switzerland and France.',
        es: 'Diseñé la arquitectura de una plataforma de generación con IA de extremo a extremo para landing pages personalizadas y contenido de marketing por lead, reduciendo el tiempo de producción de meses a 1–2 semanas. Pipelines de LLM tipados (Zod + JSON Schema como contratos de salida con reintentos y fallbacks), inyección de contexto RAG, scoring de leads con IA desde voz y chat, generación de imágenes con Replicate, orquestación asíncrona con BullMQ, SSO con AWS Cognito y un conjunto de SDKs Web3 (transacciones sin gas, ERC20/721/1155). Lideré equipos multidisciplinares y el discovery técnico para clientes de Nueva York, Suiza y Francia.',
      },
    },
    {
      period: 'Mar 2020 — Mar 2022',
      role: {
        en: 'Senior Full-Stack Developer (Java & Vue.js)',
        es: 'Desarrollador Full-Stack Senior (Java y Vue.js)',
      },
      company: 'Prodevelop',
      achievement: {
        en: 'Port terminal management for vessel discharge and cargo logistics: a new timeslot scheduling module increased truck loading efficiency by 100%. Refactored a mission-critical legacy billing microservice, significantly increasing processing speed and unlocking modular billing features. Contributed to the company framework and mentored junior developers.',
        es: 'Gestión de terminales portuarias para la descarga de buques y la logística de mercancías: un nuevo módulo de reserva de franjas horarias aumentó un 100% la eficiencia de carga de camiones. Refactoricé un microservicio de facturación legacy crítico, aumentando de forma notable la velocidad de procesamiento y habilitando funciones de facturación modular. Contribuí al framework de la empresa y mentoricé a desarrolladores junior.',
      },
    },
    {
      period: 'Apr 2019 — Mar 2020',
      role: {
        en: 'Full-Stack Developer',
        es: 'Desarrollador Full-Stack',
      },
      company: 'Prodevelop',
      achievement: {
        en: 'Designed and built the first web applications for port operations management from scratch, focused on real-time data visualisation and database performance (Java/Spring Boot, Vue.js, PostgreSQL, Oracle).',
        es: 'Diseñé y construí desde cero las primeras aplicaciones web para la gestión de operaciones portuarias, centradas en la visualización de datos en tiempo real y el rendimiento de base de datos (Java/Spring Boot, Vue.js, PostgreSQL, Oracle).',
      },
    },
    {
      period: 'Mar 2018 — Apr 2019',
      role: {
        en: 'Full-Stack Developer',
        es: 'Desarrollador Full-Stack',
      },
      company: 'Indra',
      achievement: {
        en: 'Developed and maintained features for Public Administration projects with Java on the backend and PHP on the frontend.',
        es: 'Desarrollé y mantuve funcionalidades para proyectos de la Administración Pública con Java en el backend y PHP en el frontend.',
      },
    },
  ],
  capabilities: [
    {
      key: 'ai',
      title: {
        en: 'AI & Agentic Orchestration',
        es: 'IA y Orquestación Agéntica',
      },
      description: {
        en: 'LLM systems with contracts: typed outputs, retries, evaluation and tracing.',
        es: 'Sistemas LLM con contratos: salidas tipadas, reintentos, evaluación y trazabilidad.',
      },
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
      title: {
        en: 'Robust Backend & Cloud',
        es: 'Backend Robusto y Cloud',
      },
      description: {
        en: 'Microservices and APIs built to be operated: typed, tested, observable.',
        es: 'Microservicios y APIs pensados para operarse: tipados, testeados, observables.',
      },
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
      title: {
        en: 'Frontend & Product',
        es: 'Frontend y Producto',
      },
      description: {
        en: 'Interfaces with intent, from design system to OAuth flows.',
        es: 'Interfaces con intención, del design system a los flujos OAuth.',
      },
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

const PROFILES: Record<string, LocalizedPortfolioProfile> = {
  [LUISBZ.slug]: LUISBZ,
};

export function getPortfolioProfile(
  slug: string
): LocalizedPortfolioProfile | null {
  return PROFILES[slug] ?? null;
}

/** Flattens a localized profile down to plain strings for the active locale. */
export function resolvePortfolioProfile(
  profile: LocalizedPortfolioProfile,
  locale: Locale
): PortfolioProfile {
  return {
    slug: profile.slug,
    name: profile.name,
    role: profile.role[locale],
    headline: profile.headline[locale],
    location: profile.location,
    linkedinUrl: profile.linkedinUrl,
    manifesto: profile.manifesto.map((paragraph) => paragraph[locale]),
    experience: profile.experience.map((entry) => ({
      period: entry.period,
      role: entry.role[locale],
      company: entry.company,
      achievement: entry.achievement[locale],
    })),
    capabilities: profile.capabilities.map((capability) => ({
      key: capability.key,
      title: capability.title[locale],
      description: capability.description[locale],
      technologies: capability.technologies,
    })),
  };
}
