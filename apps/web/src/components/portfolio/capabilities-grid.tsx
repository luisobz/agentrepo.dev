'use client';

import { motion } from 'framer-motion';
import { Cpu, Layers, Sparkles } from 'lucide-react';
import type { Capability } from '../../lib/portfolio';

const ICONS: Record<Capability['key'], typeof Cpu> = {
  ai: Cpu,
  backend: Layers,
  ui: Sparkles,
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const card = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
};

function CapabilityCard({ capability }: { capability: Capability }) {
  const Icon = ICONS[capability.key];
  return (
    <motion.div variants={card} className="group relative h-full">
      {/* Gradient border glow on hover */}
      <div
        aria-hidden="true"
        className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#7a2230] via-[#c4909a]/40 to-[#2f5d8a] opacity-0 blur-[2px] transition-opacity duration-500 group-hover:opacity-70"
      />
      <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-[#1b1714] p-7">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#7a2230]/60 bg-[#7a2230]/15 text-[#e8c2ca]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-[#fdf8ef]">
          {capability.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#cfc6b8]">
          {capability.description}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {capability.technologies.map((technology) => (
            <li
              key={technology}
              className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-[#cfc6b8] transition-colors group-hover:border-[#c4909a]/40"
            >
              {technology}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

export function CapabilitiesGrid({ capabilities }: { capabilities: Capability[] }) {
  return (
    <section aria-labelledby="capabilities-heading" className="px-6 py-20 sm:px-10">
      <div className="mx-auto w-full max-w-5xl">
        <h2
          id="capabilities-heading"
          className="mb-12 text-3xl font-semibold tracking-tight text-[#fdf8ef] sm:text-4xl"
        >
          What I bring
        </h2>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.key} capability={capability} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
