import { Check, X } from 'lucide-react';
import { comparisonData } from '@/lib/data/features-data';

function StatusCell({ value }: { value: boolean }) {
  return value ? (
    <div className="flex items-center justify-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/15">
        <Check className="h-4 w-4 text-teal-400" />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800/50">
        <X className="h-4 w-4 text-zinc-600" />
      </div>
    </div>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-20 sm:py-28 bg-zinc-900/30">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            ¿Por qué Red Salud vs hojas de cálculo o papel?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400">
            Comparamos honestamente. Mirá qué te ofrece cada opción y decidí
            con información real.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          {/* Header */}
          <div className="grid grid-cols-4 gap-0 border-b border-white/[0.06] bg-white/[0.03]">
            <div className="px-4 py-4 sm:px-6">
              <span className="text-sm font-medium text-zinc-400">
                Funcionalidad
              </span>
            </div>
            <div className="px-3 py-4 text-center sm:px-6">
              <span className="text-sm font-bold text-teal-400">
                Red Salud
              </span>
            </div>
            <div className="px-3 py-4 text-center sm:px-6">
              <span className="text-sm font-medium text-zinc-400">Excel</span>
            </div>
            <div className="px-3 py-4 text-center sm:px-6">
              <span className="text-sm font-medium text-zinc-400">Papel</span>
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-4 gap-0 ${
                i < comparisonData.length - 1
                  ? 'border-b border-white/[0.04]'
                  : ''
              } ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}
            >
              <div className="px-4 py-3.5 sm:px-6">
                <span className="text-sm text-zinc-300">{row.feature}</span>
              </div>
              <div className="px-3 py-3.5 sm:px-6">
                <StatusCell value={row.redSalud} />
              </div>
              <div className="px-3 py-3.5 sm:px-6">
                <StatusCell value={row.excel} />
              </div>
              <div className="px-3 py-3.5 sm:px-6">
                <StatusCell value={row.papel} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Y eso es solo el comienzo. Red Salud se actualiza constantemente con
          nuevas funcionalidades basadas en lo que los médicos realmente
          necesitan.
        </p>
      </div>
    </section>
  );
}
