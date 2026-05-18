'use client';

import type { WizardData } from '../onboarding-wizard';
import { WizardFooter } from './wizard-footer';

interface Props {
  data: WizardData;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}

export function ReviewStep({ data, onBack, onNext, submitting }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Revisa antes de activar</h2>
      <p className="text-slate-600 mb-8">
        Esto es lo que vamos a configurar. Despues podes ajustar TODO desde el panel.
      </p>

      <div className="space-y-4">
        <Card title="Organizacion">
          <Row label="Tipo" value={data.template?.name ?? '—'} />
          <Row label="Nombre comercial" value={data.name} />
          <Row label="Subdominio" value={`${data.slug}.redsalud.app`} mono />
          {data.primary_specialty && (
            <Row label="Especialidad principal" value={data.primary_specialty} />
          )}
          {data.legal_name && <Row label="Razon social" value={data.legal_name} />}
          {data.tax_id && <Row label="RIF / Tax ID" value={data.tax_id} />}
        </Card>

        <Card title="Sede principal">
          <Row label="Nombre" value={data.location.name ?? '—'} />
          {data.location.address_line && (
            <Row label="Direccion" value={data.location.address_line} />
          )}
          {data.location.city && (
            <Row
              label="Ubicacion"
              value={[data.location.city, data.location.state].filter(Boolean).join(', ')}
            />
          )}
          <Row
            label="Capacidad"
            value={`${data.location.total_consultation_rooms ?? 0} consultorios · ${data.location.total_beds ?? 0} camas`}
          />
        </Card>

        <Card title="Branding">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded"
              style={{ background: data.branding.primary_color }}
            />
            <div
              className="w-8 h-8 rounded"
              style={{ background: data.branding.accent_color }}
            />
            <span className="text-sm text-slate-600 font-mono">
              {data.branding.primary_color} / {data.branding.accent_color}
            </span>
          </div>
          <Row label="Tipografia" value={data.branding.font_family} />
          <Row label="Densidad" value={data.branding.ui_density} />
          <Row
            label="Terminologia"
            value={`"${data.branding.terminology.patient}" / "${data.branding.terminology.appointment}"`}
          />
        </Card>

        <Card title="Modulos activos">
          <div className="flex flex-wrap gap-1.5">
            {data.selected_modules.map((m) => (
              <span
                key={m}
                className="px-2 py-1 rounded bg-[rgb(var(--brand-primary)/0.1)] text-[rgb(var(--brand-primary))] text-xs font-medium"
              >
                {m}
              </span>
            ))}
            {data.selected_modules.length === 0 && (
              <span className="text-sm text-slate-500">Solo modulos esenciales</span>
            )}
          </div>
        </Card>

        <Card title="Equipo">
          {data.invites.length === 0 ? (
            <p className="text-sm text-slate-500">No hay invitaciones — vos sos el unico miembro.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {data.invites.map((inv, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <span className="text-slate-700">{inv.email}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">{inv.role}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <WizardFooter
        onBack={onBack}
        onNext={onNext}
        submitting={submitting}
        nextLabel="Activar mi panel"
      />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-1">
      <span className="text-xs text-slate-500 w-32 shrink-0">{label}</span>
      <span className={`text-sm text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
