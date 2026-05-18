'use client';

import { useParams } from 'next/navigation';
import { useOrganizationContext } from '@/lib/providers/organization-provider';

export default function ModulePlaceholderPage() {
  const params = useParams();
  const moduleKey = params?.module as string;
  const { enabledModules, hasModule } = useOrganizationContext();

  const module = enabledModules.find((m) => m.key === moduleKey);

  if (!hasModule(moduleKey) || !module) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Modulo no disponible</h2>
        <p className="text-sm text-slate-500">
          Este modulo no esta activo o no existe. Activalo desde Configuracion.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-slate-500 uppercase tracking-wide">{module.category}</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{module.name}</h1>
        {module.description && <p className="text-slate-600 mt-1">{module.description}</p>}
      </header>

      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[rgb(var(--brand-primary)/0.1)] flex items-center justify-center mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Modulo activo</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          La funcionalidad completa de este modulo se va a habilitar en una proxima fase. Por ahora
          esta reservado el espacio en la navegacion.
        </p>
      </div>
    </div>
  );
}
