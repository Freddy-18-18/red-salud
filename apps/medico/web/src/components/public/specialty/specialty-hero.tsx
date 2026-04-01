import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PublicSpecialty } from '@/lib/data/specialties-public';
import { getColors, getIcon } from './specialty-icon-map';

interface SpecialtyHeroProps {
  specialty: PublicSpecialty;
}

export function SpecialtyHero({ specialty }: SpecialtyHeroProps) {
  const colors = getColors(specialty.accentColor);
  const Icon = getIcon(specialty.iconName);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient using specialty color */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />
        <div
          className="absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full blur-[140px] opacity-20"
          style={{ backgroundColor: `var(--color-${specialty.accentColor}-500, #14b8a6)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: `var(--color-${specialty.accentColor}-400, #2dd4bf)` }}
        />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
        {/* Specialty badge */}
        <div className={`mb-8 inline-flex items-center gap-2 rounded-full ${colors.pill} border ${colors.border} px-4 py-1.5`}>
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{specialty.category}</span>
        </div>

        {/* Icon */}
        <div className={`mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl ${colors.bgLight} ring-1 ${colors.ring}`}>
          <Icon className={`h-10 w-10 ${colors.text}`} />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className={`bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} bg-clip-text text-transparent`}>
            {specialty.heroTitle ?? specialty.name}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 sm:text-xl">
          {specialty.heroSubtitle ?? specialty.shortDescription}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className={`group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} px-8 py-3.5 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:opacity-90`}
          >
            Comenzar con {specialty.name}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/especialidades"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/30 transition-all duration-300"
          >
            Ver todas las especialidades
          </Link>
        </div>
      </div>
    </section>
  );
}
