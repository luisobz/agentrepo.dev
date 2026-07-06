'use client';

import { AvatarSlot } from '@agentrepo/avatar';

export interface AvatarGuidanceProps {
  message: string;
}

/** Banner where the site avatar narrates what the sub-agents are doing. */
export function AvatarGuidance({ message }: AvatarGuidanceProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
      <div className="shrink-0">
        <AvatarSlot id="playground-guide" />
      </div>
      <p
        role="status"
        aria-live="polite"
        className="relative rounded-2xl rounded-bl-sm border border-[#c4909a]/30 bg-[#7a2230]/15 px-4 py-3 text-sm leading-relaxed text-[#fdf8ef]"
      >
        {message}
      </p>
    </div>
  );
}
