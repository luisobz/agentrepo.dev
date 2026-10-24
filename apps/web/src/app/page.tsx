import type { Metadata } from 'next';
import { Hero } from '../components/home/hero';
import { HomeBackground } from '../components/home/home-background';
import { CatalogueOverview } from '../components/home/catalogue-overview';
import { getServerLocale } from '../lib/i18n/server';
import {
  homeStructuredData,
  serializeStructuredData,
} from '../lib/seo/structured-data';
import { LatestSection } from '../components/home/latest-section';

export const metadata: Metadata = {
  title: { absolute: 'AgentRepo.dev — AI skills, agents and practical guides' },
  alternates: { canonical: '/' },
  description:
    'Curated skills, agents and notes for building with AI — searchable, versioned and ready to reuse.',
};

export default async function HomePage() {
  const locale = await getServerLocale();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeStructuredData(homeStructuredData(locale)),
        }}
      />
      <HomeBackground />
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Hero />
        <CatalogueOverview />
        <LatestSection />
      </div>
    </>
  );
}
