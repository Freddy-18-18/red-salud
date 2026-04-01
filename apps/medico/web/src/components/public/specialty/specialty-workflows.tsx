import { ChevronRight } from 'lucide-react';
import type { PublicSpecialty } from '@/lib/data/specialties-public';
import { getColors } from './specialty-icon-map';

interface SpecialtyWorkflowsProps {
  specialty: PublicSpecialty;
}

export function SpecialtyWorkflows({ specialty }: SpecialtyWorkflowsProps) {
  const colors = getColors(specialty.accentColor);
  const workflows = specialty.workflows;

  if (!workflows || workflows.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Flujos de trabajo optimizados
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Cada paso de tus procesos clínicos más importantes, digitalizado y secuenciado para que no pierdas tiempo.
          </p>
        </div>

        {/* Workflows */}
        <div className="grid gap-6 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.name}
              className={`rounded-2xl border ${colors.border} bg-white/5 p-6 backdrop-blur-sm`}
            >
              <h3 className={`text-lg font-semibold ${colors.text} mb-6`}>
                {workflow.name}
              </h3>
              <ol className="space-y-3">
                {workflow.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {/* Step number */}
                    <span
                      className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${colors.bgLight} ${colors.text}`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-2 pt-0.5">
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                      <span className="text-sm text-zinc-300 leading-relaxed">{step}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
