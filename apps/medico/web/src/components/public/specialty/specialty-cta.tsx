import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PublicSpecialty } from '@/lib/data/specialties-public';
import { getColors } from './specialty-icon-map';

interface SpecialtyCtaProps {
  specialty: PublicSpecialty;
}

export function SpecialtyCta({ specialty }: SpecialtyCtaProps) {
  const colors = getColors(specialty.accentColor);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />
        <div
          className="absolute top-0 left-1/3 h-[400px] w-[400px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: `var(--color-${specialty.accentColor}-500, #14b8a6)` }}
        />
        <div
          className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full blur-[100px] opacity-15"
          style={{ backgroundColor: `var(--color-${specialty.accentColor}-400, #2dd4bf)` }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          Transformá tu práctica de{' '}
          <span className={`bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} bg-clip-text text-transparent`}>
            {specialty.name}
          </span>
        </h2>
        <p className="mt-6 text-lg text-zinc-400">
          Creá tu cuenta gratuita y descubrí cómo Red Salud se adapta a los flujos de trabajo de tu especialidad.
          Sin compromiso, sin tarjeta de crédito.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className={`group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} px-10 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:opacity-90`}
          >
            Comenzar gratis
            <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/especialidades"
            className={`inline-flex items-center gap-2 ${colors.text} hover:text-white font-medium transition-colors duration-200`}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Ver otras especialidades
          </Link>
        </div>

        <p className="mt-6 text-sm text-zinc-500">
          Sin tarjeta de crédito. Configuración en minutos. Soporte incluido.
        </p>
      </div>
    </section>
  );
}
