'use client';

import { useOrganizationContext } from '@/lib/providers/organization-provider';
import { useOrganizationKPIs } from '@/lib/hooks/use-organization';

export default function OverviewPage() {
  const { organization, locations, enabledModules } = useOrganizationContext();
  const { data: kpis } = useOrganizationKPIs(organization.id);

  const greetTerm = organization.branding.terminology.patient;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-slate-500 uppercase tracking-wide">Inicio</p>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Hola, {organization.name}</h1>
        <p className="text-slate-600 mt-1">
          Tu panel para gestionar {greetTerm}s, equipo, sedes y operaciones.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Sedes activas" value={kpis?.total_locations ?? '—'} accent="primary" />
        <KPICard title="Miembros del equipo" value={kpis?.total_members ?? '—'} accent="primary" />
        <KPICard
          title="Modulos activos"
          value={enabledModules.length}
          accent="accent"
        />
        <KPICard
          title="Plan"
          value={organization.plan === 'trial' ? `Trial (${kpis?.trial_days_remaining ?? '?'}d)` : organization.plan}
          accent="secondary"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Tus sedes</h2>
          {locations.length === 0 ? (
            <p className="text-sm text-slate-500">Aun no agregaste sedes.</p>
          ) : (
            <ul className="space-y-3">
              {locations.map((loc) => (
                <li
                  key={loc.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm">
                      {loc.name}
                      {loc.is_main && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {[loc.city, loc.state].filter(Boolean).join(', ') || 'Sin direccion'}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>{loc.total_consultation_rooms} consultorios</div>
                    {loc.total_beds > 0 && <div>{loc.total_beds} camas</div>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Modulos disponibles</h2>
          <div className="flex flex-wrap gap-2">
            {enabledModules.map((m) => (
              <span
                key={m.key}
                className="px-2.5 py-1 rounded bg-[rgb(var(--brand-primary)/0.1)] text-[rgb(var(--brand-primary))] text-xs font-medium"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function KPICard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string | number;
  accent: 'primary' | 'accent' | 'secondary';
}) {
  const accentClass = {
    primary: 'text-[rgb(var(--brand-primary))]',
    accent: 'text-[rgb(var(--brand-accent))]',
    secondary: 'text-slate-700',
  }[accent];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${accentClass}`}>{value}</p>
    </div>
  );
}
