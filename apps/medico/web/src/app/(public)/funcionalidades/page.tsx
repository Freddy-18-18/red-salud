import type { Metadata } from 'next';
import { FeaturesSection } from '@/components/public/features-section';
import { CtaSection } from '@/components/public/cta-section';

export const metadata: Metadata = {
  title: 'Funcionalidades — Red Salud',
  description:
    'Todas las herramientas clínicas que necesitás: agenda inteligente, consultas digitales, recetas electrónicas, IA diagnóstica y más.',
};

export default function FuncionalidadesPage() {
  return (
    <div className="pt-24">
      {/* Header */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Funcionalidades</h1>
          <p className="mt-4 text-lg text-zinc-400">
            Cada herramienta diseñada para optimizar tu flujo de trabajo clínico, desde la primera consulta
            hasta el seguimiento del paciente.
          </p>
        </div>
      </section>

      <FeaturesSection />
      <CtaSection />
    </div>
  );
}
