'use client';

import { useMemo } from 'react';
import { useModuleCatalog } from '@/lib/hooks/use-modules';
import type { ModuleCategory } from '@red-salud/types';
import type { WizardData } from '../onboarding-wizard';
import { WizardFooter } from './wizard-footer';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core: 'Esenciales (siempre activos)',
  operations: 'Operaciones diarias',
  specialty: 'Modulos por especialidad',
  enterprise: 'Enterprise (opcional)',
};

const CATEGORY_DESC: Record<ModuleCategory, string> = {
  core: 'No se pueden apagar — son la base del sistema',
  operations: 'El dia a dia de tu clinica: agenda, pacientes, facturacion',
  specialty: 'Activa solo lo que tu clinica realmente usa',
  enterprise: 'Solo si tenes seguros, pacientes internacionales, o multi-organizacion',
};

export function ModulesStep({ data, onChange, onBack, onNext, submitting }: Props) {
  const { data: catalog, isLoading } = useModuleCatalog();

  const grouped = useMemo(() => {
    if (!catalog) return null;
    const groups: Record<ModuleCategory, typeof catalog> = {
      core: [],
      operations: [],
      specialty: [],
      enterprise: [],
    };
    for (const m of catalog) groups[m.category].push(m);
    return groups;
  }, [catalog]);

  const recommended = data.template?.recommended_modules ?? [];
  const selected = new Set(data.selected_modules);

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange({ selected_modules: Array.from(next) });
  };

  if (isLoading || !grouped) {
    return <div className="py-20 text-center text-slate-500">Cargando modulos...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Que modulos vas a usar</h2>
      <p className="text-slate-600 mb-8">
        Tu plantilla ya preselecciono lo que tipicamente usa una{' '}
        <strong>{data.template?.name}</strong>. Ajusta lo que quieras — todo se puede prender o
        apagar despues.
      </p>

      <div className="space-y-8">
        {(['core', 'operations', 'specialty', 'enterprise'] as ModuleCategory[]).map((cat) => (
          <section key={cat}>
            <header className="mb-3">
              <h3 className="text-sm font-bold text-slate-900">{CATEGORY_LABELS[cat]}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{CATEGORY_DESC[cat]}</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {grouped[cat].map((m) => {
                const isSelected = selected.has(m.key) || m.is_core;
                const isRecommended = recommended.includes(m.key);
                return (
                  <button
                    key={m.key}
                    onClick={() => !m.is_core && toggle(m.key)}
                    disabled={m.is_core}
                    className={`text-left p-4 rounded-lg border-2 transition relative ${
                      isSelected
                        ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary)/0.05)]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${m.is_core ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                  >
                    {isRecommended && !isSelected && (
                      <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        Recomendado
                      </span>
                    )}
                    {m.is_core && (
                      <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        Core
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center text-white text-xs ${
                          isSelected ? 'bg-[rgb(var(--brand-primary))]' : 'bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 text-sm">{m.name}</h4>
                        {m.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <WizardFooter onBack={onBack} onNext={onNext} submitting={submitting} />
    </div>
  );
}
