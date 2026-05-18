'use client';

import { useOrganizationContext } from '@/lib/providers/organization-provider';

export function ModuleGuard({
  moduleKey,
  children,
}: {
  moduleKey: string;
  children: React.ReactNode;
}) {
  const { hasModule } = useOrganizationContext();
  if (!hasModule(moduleKey)) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Modulo no activo</h2>
        <p className="text-sm text-slate-500">
          Activa este modulo desde Configuracion · Modulos.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
