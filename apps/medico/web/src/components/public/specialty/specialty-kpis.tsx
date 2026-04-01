import { TrendingUp, Target } from 'lucide-react';
import type { PublicSpecialty } from '@/lib/data/specialties-public';
import { getColors } from './specialty-icon-map';

interface SpecialtyKPIsProps {
  specialty: PublicSpecialty;
}

export function SpecialtyKPIs({ specialty }: SpecialtyKPIsProps) {
  const colors = getColors(specialty.accentColor);
  const kpis = specialty.kpis;

  if (!kpis || kpis.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-zinc-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Métricas que importan en{' '}
            <span className={`bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} bg-clip-text text-transparent`}>
              {specialty.name}
            </span>
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            KPIs específicos de tu especialidad para medir lo que realmente importa en tu práctica.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.name}
              className={`rounded-2xl border ${colors.border} bg-white/5 p-6 backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${colors.bgLight}`}>
                  <TrendingUp className={`h-5 w-5 ${colors.text}`} />
                </div>
                {kpi.target && (
                  <div className={`inline-flex items-center gap-1.5 rounded-full ${colors.pill} px-3 py-1`}>
                    <Target className="h-3 w-3" />
                    <span className="text-xs font-medium">{kpi.target}</span>
                  </div>
                )}
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{kpi.name}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{kpi.description}</p>

              {/* Visual progress bar (decorative) */}
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} opacity-60`}
                  style={{ width: `${65 + Math.random() * 30}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
