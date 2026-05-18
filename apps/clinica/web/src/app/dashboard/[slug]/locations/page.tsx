'use client';

import { useState } from 'react';
import { useOrganizationContext } from '@/lib/providers/organization-provider';
import {
  useLocations,
  useCreateLocation,
  useDeactivateLocation,
} from '@/lib/hooks/use-locations';
import { ModuleGuard } from '@/components/dashboard/module-guard';
import { LocationFormDialog } from '@/components/locations/location-form-dialog';

export default function LocationsPage() {
  const { organization, isAdmin } = useOrganizationContext();
  const { data: locations, isLoading } = useLocations(organization.id);
  const createLocation = useCreateLocation(organization.id);
  const deactivate = useDeactivateLocation(organization.id);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <ModuleGuard moduleKey="locations">
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-wide">Sedes</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {locations?.length ?? 0} sedes
            </h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setDialogOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 transition shadow-sm"
            >
              + Nueva sede
            </button>
          )}
        </header>

        {isLoading ? (
          <p className="text-sm text-slate-500">Cargando...</p>
        ) : !locations || locations.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No hay sedes todavia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className={`rounded-xl border bg-white p-5 ${
                  loc.is_active ? 'border-slate-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {loc.name}
                      {loc.is_main && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                      {!loc.is_active && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Inactiva
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {[loc.address_line, loc.city, loc.state].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div>
                    <dt className="text-slate-400">Consultorios</dt>
                    <dd className="font-semibold">{loc.total_consultation_rooms}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Camas</dt>
                    <dd className="font-semibold">{loc.total_beds}</dd>
                  </div>
                  <div className="col-span-2 mt-1 flex flex-wrap gap-1">
                    {loc.has_emergency && <Tag>Urgencias</Tag>}
                    {loc.has_hospitalization && <Tag>Hospitalizacion</Tag>}
                    {loc.has_surgery_rooms && <Tag>Quirofano</Tag>}
                    {loc.has_lab && <Tag>Lab</Tag>}
                    {loc.has_imaging && <Tag>Imagen</Tag>}
                  </div>
                </dl>
                {isAdmin && loc.is_active && !loc.is_main && (
                  <button
                    onClick={() => deactivate.mutate(loc.id)}
                    className="mt-4 text-xs text-red-600 hover:underline"
                  >
                    Desactivar sede
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {dialogOpen && (
          <LocationFormDialog
            onClose={() => setDialogOpen(false)}
            onSubmit={async (input) => {
              await createLocation.mutateAsync(input);
              setDialogOpen(false);
            }}
          />
        )}
      </div>
    </ModuleGuard>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wide">
      {children}
    </span>
  );
}
