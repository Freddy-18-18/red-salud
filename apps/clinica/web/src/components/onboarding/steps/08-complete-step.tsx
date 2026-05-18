'use client';

import type { WizardData } from '../onboarding-wizard';

interface Props {
  data: WizardData;
  onContinue: () => void;
}

export function CompleteStep({ data, onContinue }: Props) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto mb-6 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-3">¡Tu panel esta listo!</h2>
      <p className="text-slate-600 max-w-md mx-auto mb-8">
        <strong>{data.name}</strong> ya esta configurada. Tu trial gratuito incluye 30 dias para
        probar todo. Estamos listos para que entres al panel.
      </p>

      <div className="inline-flex flex-col gap-2 items-stretch">
        <button
          onClick={onContinue}
          className="px-8 py-3 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 transition shadow-md"
        >
          Entrar al panel →
        </button>
        <p className="text-xs text-slate-500 mt-2">
          URL: <span className="font-mono">{data.slug}.redsalud.app</span>
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
        <NextStep
          step="1"
          title="Configura agenda"
          desc="Define horarios y disponibilidad de tus medicos"
        />
        <NextStep
          step="2"
          title="Carga pacientes"
          desc="Importa tu base actual o empezá desde cero"
        />
        <NextStep
          step="3"
          title="Personaliza mas"
          desc="Logo, dominio propio, mas usuarios desde Configuracion"
        />
      </div>
    </div>
  );
}

function NextStep({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-xs font-mono text-slate-600 mb-2">
        Paso {step}
      </span>
      <h3 className="font-semibold text-sm text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
  );
}
