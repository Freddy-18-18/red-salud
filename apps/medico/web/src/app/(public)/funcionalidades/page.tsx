import type { Metadata } from 'next';
import { featuresDetailed } from '@/lib/data/features-data';
import { FeatureNav } from '@/components/public/features/feature-nav';
import { FeatureSection } from '@/components/public/features/feature-section';
import { ComparisonTable } from '@/components/public/features/comparison-table';
import { CtaSection } from '@/components/public/cta-section';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Funcionalidades — Red Salud',
  description:
    'Todas las herramientas clínicas que necesitás: agenda inteligente, consultas digitales, recetas electrónicas, IA diagnóstica y más.',
};

export default function FuncionalidadesPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-teal-500/8 blur-[140px]" />
          <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-cyan-500/6 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-xs font-medium text-teal-300">
              8 módulos integrados
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            Todas las herramientas para{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              tu consultorio
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Cada módulo fue diseñado para un flujo clínico específico. Se
            integran entre sí y se adaptan a tu especialidad. Sin
            configuraciones complicadas, sin curva de aprendizaje.
          </p>
        </div>
      </section>

      {/* Sticky navigation */}
      <FeatureNav features={featuresDetailed} />

      {/* Feature sections */}
      {featuresDetailed.map((feature, index) => (
        <FeatureSection key={feature.slug} feature={feature} index={index} />
      ))}

      {/* Comparison table */}
      <ComparisonTable />

      {/* CTA */}
      <CtaSection />
    </div>
  );
}
