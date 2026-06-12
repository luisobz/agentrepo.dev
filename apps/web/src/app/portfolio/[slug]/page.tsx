import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CapabilitiesGrid } from '../../../components/portfolio/capabilities-grid';
import { ContactForm } from '../../../components/portfolio/contact-form';
import { ExperienceTimeline } from '../../../components/portfolio/experience-timeline';
import { PortfolioHero } from '../../../components/portfolio/portfolio-hero';
import { getPortfolioProfile } from '../../../lib/portfolio';

interface PortfolioPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PortfolioPageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = getPortfolioProfile(slug);
  if (!profile) {
    return { title: 'Portfolio not found | AgentRepo.dev' };
  }
  return {
    title: `${profile.name} — ${profile.role}`,
    description: profile.manifesto[0],
    robots: { index: false },
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = await params;
  const profile = getPortfolioProfile(slug);
  if (!profile) {
    notFound();
  }

  return (
    // -mt-24 reclaims the global <main> top padding: this page has no header.
    <div className="-mt-24 min-h-screen bg-[#14110f] text-[#fdf8ef]">
      {/* Premium dark backdrop: garnet glow, blue counter-glow and vignette */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(80%_55%_at_70%_-10%,rgba(122,34,48,0.28),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_10%_100%,rgba(47,93,138,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_50%_50%,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      <div className="relative">
        <PortfolioHero profile={profile} />
        <ExperienceTimeline entries={profile.experience} />
        <CapabilitiesGrid capabilities={profile.capabilities} />
        <ContactForm />

        <p className="pb-10 text-center font-mono text-xs text-[#8d8273]">
          {profile.name} · built on agentrepo.dev
        </p>
      </div>
    </div>
  );
}
