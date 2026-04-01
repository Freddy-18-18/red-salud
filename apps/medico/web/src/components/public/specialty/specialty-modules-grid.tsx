import type { PublicSpecialty } from '@/lib/data/specialties-public';
import { getColors, getIcon } from './specialty-icon-map';

interface SpecialtyModulesGridProps {
  specialty: PublicSpecialty;
}

export function SpecialtyModulesGrid({ specialty }: SpecialtyModulesGridProps) {
  const colors = getColors(specialty.accentColor);
  const modules = specialty.modules;

  if (!modules || modules.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Módulos diseñados para{' '}
            <span className={`bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} bg-clip-text text-transparent`}>
              {specialty.name}
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            No es un sistema genérico con un logo diferente. Cada módulo fue pensado para los flujos reales de tu especialidad.
          </p>
        </div>

        {/* Modules grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const ModIcon = getIcon(mod.iconName);
            return (
              <div
                key={mod.name}
                className={`group rounded-2xl border ${colors.border} bg-white/5 p-6 backdrop-blur-sm hover:bg-white/[0.08] transition-all duration-300`}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bgLight} mb-4`}>
                  <ModIcon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{mod.name}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{mod.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
