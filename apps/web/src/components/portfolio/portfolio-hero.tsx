'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { PortfolioProfile } from '../../lib/portfolio';

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export function PortfolioHero({ profile }: { profile: PortfolioProfile }) {
  return (
    <section className="relative flex min-h-[90vh] flex-col justify-center px-6 py-24 sm:px-10">
      <Link
        href="/"
        className="group fixed left-5 top-5 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-[#cfc6b8] backdrop-blur-md transition-colors hover:border-[#c4909a] hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Volver al Repositorio
      </Link>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-4xl"
      >
        <motion.p
          variants={fadeUp}
          className="font-mono text-sm uppercase tracking-[0.2em] text-[#c4909a]"
        >
          {profile.headline}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="mt-6 bg-gradient-to-br from-[#fdf8ef] via-[#e8c2ca] to-[#7a2230] bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent sm:text-6xl lg:text-7xl"
        >
          {profile.name} — {profile.role}
        </motion.h1>

        <motion.div variants={fadeUp} className="mt-10 max-w-2xl space-y-4">
          {profile.manifesto.map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-[#cfc6b8]"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-12 flex items-center gap-3 font-mono text-xs text-[#8d8273]"
        >
          <span className="h-px w-12 bg-gradient-to-r from-[#7a2230] to-transparent" />
          autonomous agents · LLM systems · hexagonal backends
        </motion.div>
      </motion.div>
    </section>
  );
}
