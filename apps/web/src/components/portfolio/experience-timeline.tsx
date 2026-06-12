'use client';

import { motion } from 'framer-motion';
import type { ExperienceEntry } from '../../lib/portfolio';

function TimelineItem({ entry, index }: { entry: ExperienceEntry; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
      className="group relative pl-12 sm:pl-16"
    >
      {/* Node: lights up when its card is hovered */}
      <span
        aria-hidden="true"
        className="absolute left-[11px] top-7 h-3.5 w-3.5 rounded-full border-2 border-[#7a2230] bg-[#14110f] transition-all duration-300 group-hover:scale-125 group-hover:bg-[#7a2230] group-hover:shadow-[0_0_18px_rgba(196,144,154,0.65)] sm:left-[19px]"
      />

      <div className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#c4909a]/50 group-hover:bg-white/[0.06] group-hover:shadow-[0_8px_40px_rgba(122,34,48,0.25)]">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-[#c4909a]">
          {entry.period}
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[#fdf8ef]">
          {entry.role}
          <span className="text-[#8d8273]"> · {entry.company}</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#cfc6b8]">
          {entry.achievement}
        </p>
      </div>
    </motion.li>
  );
}

export function ExperienceTimeline({ entries }: { entries: ExperienceEntry[] }) {
  return (
    <section aria-labelledby="experience-heading" className="px-6 py-20 sm:px-10">
      <div className="mx-auto w-full max-w-4xl">
        <h2
          id="experience-heading"
          className="mb-12 text-3xl font-semibold tracking-tight text-[#fdf8ef] sm:text-4xl"
        >
          Professional journey
        </h2>

        <ul className="relative">
          {/* Continuous vertical line */}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-4 top-2 w-px bg-gradient-to-b from-[#7a2230] via-white/15 to-transparent sm:left-6"
          />
          {entries.map((entry, index) => (
            <TimelineItem
              key={`${entry.company}-${entry.period}`}
              entry={entry}
              index={index}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
