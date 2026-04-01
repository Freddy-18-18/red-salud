import type { PublicSpecialty } from '@/lib/data/specialties-public';
import { getColors, getIcon } from './specialty-icon-map';

interface SpecialtyDifferentiatorsProps {
  specialty: PublicSpecialty;
}

export function SpecialtyDifferentiators({ specialty }: SpecialtyDifferentiatorsProps) {
  const colors = getColors(specialty.accentColor);
  const differentiators = specialty.differentiators;

  if (!differentiators || differentiators.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            ¿Por qué Red Salud para{' '}
            <span className={`bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} bg-clip-text text-transparent`}>
              {specialty.name}
            </span>
            ?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            No es otro sistema genérico. Esto es lo que nos diferencia en tu especialidad.
          </p>
        </div>

        {/* Differentiator cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {differentiators.map((diff) => {
            const DiffIcon = getIcon(diff.iconName);
            return (
              <div
                key={diff.title}
                className={`rounded-2xl border ${colors.border} bg-white/5 p-8 backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300`}
              >
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl ${colors.bgLight} mb-5`}>
                  <DiffIcon className={`h-7 w-7 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{diff.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{diff.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
