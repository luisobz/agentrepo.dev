'use client';

import { useLocale } from '@agentrepo/ui';
import {
  resolvePortfolioProfile,
  type LocalizedPortfolioProfile,
} from '../../lib/portfolio';
import { LocaleSwitcher } from '../layout/locale-switcher';
import { CapabilitiesGrid } from './capabilities-grid';
import { ContactForm } from './contact-form';
import { ExperienceTimeline } from './experience-timeline';
import { PortfolioHero } from './portfolio-hero';

/**
 * Client boundary for the portfolio: the header (and its locale switcher) is
 * hidden on this immersive page, so we resolve the localized profile here and
 * surface a standalone language toggle in the corner.
 */
export function PortfolioContent({
  profile,
}: {
  profile: LocalizedPortfolioProfile;
}) {
  const { locale } = useLocale();
  const resolved = resolvePortfolioProfile(profile, locale);

  return (
    <>
      <LocaleSwitcher
        onDark
        className="fixed right-5 top-5 z-50 rounded-full border border-white/15 bg-white/5 px-2 py-1 backdrop-blur-md"
      />

      <PortfolioHero profile={resolved} />
      <ExperienceTimeline entries={resolved.experience} />
      <CapabilitiesGrid capabilities={resolved.capabilities} />
      <ContactForm />

      <p className="pb-10 text-center font-mono text-xs text-[#8d8273]">
        {resolved.name} · built on agentrepo.dev
      </p>
    </>
  );
}
