'use client';

import type { ClinicProfileTemplate } from '@red-salud/types';

interface Props {
  templates: ClinicProfileTemplate[];
  onSelect: (template: ClinicProfileTemplate) => void;
}

export function ProfileStep({ templates, onSelect }: Props) {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          ¿Que tipo de organizacion vas a gestionar?
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Elegi el perfil que mas se acerque. Vamos a configurar modulos, terminologia y dashboard
          a tu medida. Todo se puede ajustar despues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl)}
            className="text-left rounded-xl border-2 border-slate-200 bg-white p-5 hover:border-[rgb(var(--brand-primary))] hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--brand-primary)/0.1)] flex items-center justify-center text-[rgb(var(--brand-primary))] font-bold text-sm">
                {tpl.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-semibold text-slate-900 leading-tight">{tpl.name}</h3>
            </div>
            <p className="text-sm text-slate-600 mb-3">{tpl.description}</p>
            <div className="text-xs text-slate-500">
              {tpl.default_modules.length} modulos preconfigurados
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
