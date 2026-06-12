import type { Metadata } from 'next';
import { Hero } from '../components/home/hero';
import { HomeBackground } from '../components/home/home-background';
import { LatestSection } from '../components/home/latest-section';

export const metadata: Metadata = {
  title: 'AgentRepo.dev | Less noise, more signal',
  description:
    'Curated skills, agents and notes for building with AI — searchable, versioned and ready to reuse.',
};

export default function HomePage() {
  return (
    <>
      <HomeBackground />
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Hero />
        <LatestSection />
      </div>
    </>
  );
}
