import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getSpecialtyBySlug,
  getAllSpecialtySlugs,
} from '@/lib/data/specialties-public';
import { SpecialtyHero } from '@/components/public/specialty/specialty-hero';
import { SpecialtyDescription } from '@/components/public/specialty/specialty-description';
import { SpecialtyModulesGrid } from '@/components/public/specialty/specialty-modules-grid';
import { SpecialtyKPIs } from '@/components/public/specialty/specialty-kpis';
import { SpecialtyWorkflows } from '@/components/public/specialty/specialty-workflows';
import { SpecialtyDifferentiators } from '@/components/public/specialty/specialty-differentiators';
import { SpecialtyCta } from '@/components/public/specialty/specialty-cta';

// ---------------------------------------------------------------------------
// Static Generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getAllSpecialtySlugs().map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const specialty = getSpecialtyBySlug(slug);
  if (!specialty) return {};

  return {
    title: `${specialty.name} — Red Salud`,
    description:
      specialty.heroSubtitle ?? specialty.shortDescription,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpecialtyPage({ params }: PageProps) {
  const { slug } = await params;
  const specialty = getSpecialtyBySlug(slug);

  if (!specialty) {
    notFound();
  }

  return (
    <div>
      {/* 1. Hero */}
      <SpecialtyHero specialty={specialty} />

      {/* 2. Long description */}
      <SpecialtyDescription specialty={specialty} />

      {/* 3. Modules */}
      <SpecialtyModulesGrid specialty={specialty} />

      {/* 4. KPIs */}
      <SpecialtyKPIs specialty={specialty} />

      {/* 5. Workflows */}
      <SpecialtyWorkflows specialty={specialty} />

      {/* 6. Differentiators */}
      <SpecialtyDifferentiators specialty={specialty} />

      {/* 7. CTA */}
      <SpecialtyCta specialty={specialty} />
    </div>
  );
}
