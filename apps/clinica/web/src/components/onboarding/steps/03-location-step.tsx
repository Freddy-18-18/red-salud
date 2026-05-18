'use client';

import type { WizardData } from '../onboarding-wizard';
import { WizardFooter } from './wizard-footer';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}

const VENEZUELA_STATES = [
  'Distrito Capital', 'Miranda', 'Vargas', 'Aragua', 'Carabobo', 'Lara',
  'Zulia', 'Tachira', 'Merida', 'Anzoategui', 'Bolivar', 'Monagas',
  'Sucre', 'Falcon', 'Yaracuy', 'Portuguesa', 'Barinas', 'Cojedes',
  'Guarico', 'Apure', 'Amazonas', 'Delta Amacuro', 'Nueva Esparta', 'Trujillo',
];

export function LocationStep({ data, onChange, onBack, onNext, submitting }: Props) {
  const loc = data.location;
  const setLoc = (patch: Partial<typeof loc>) => onChange({ location: { ...loc, ...patch } });

  const canProceed = (loc.name?.trim().length ?? 0) >= 2;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Tu primera sede</h2>
      <p className="text-slate-600 mb-8">
        Esta sera marcada como sede principal. Vas a poder agregar mas sucursales despues.
      </p>

      <div className="space-y-5 max-w-2xl">
        <Field label="Nombre de la sede" required>
          <input
            type="text"
            value={loc.name ?? ''}
            onChange={(e) => setLoc({ name: e.target.value })}
            placeholder="Ej: Sede Caracas Centro"
            className="input"
          />
        </Field>

        <Field label="Direccion">
          <input
            type="text"
            value={loc.address_line ?? ''}
            onChange={(e) => setLoc({ address_line: e.target.value })}
            placeholder="Av. Principal, Edif. Salud, Piso 3"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Ciudad">
            <input
              type="text"
              value={loc.city ?? ''}
              onChange={(e) => setLoc({ city: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Estado / Provincia">
            <select
              value={loc.state ?? ''}
              onChange={(e) => setLoc({ state: e.target.value })}
              className="input"
            >
              <option value="">Seleccionar...</option>
              {VENEZUELA_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Telefono de la sede">
            <input
              type="tel"
              value={loc.phone ?? ''}
              onChange={(e) => setLoc({ phone: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Email de la sede">
            <input
              type="email"
              value={loc.email ?? ''}
              onChange={(e) => setLoc({ email: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Capacidad operativa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Consultorios">
              <input
                type="number"
                min={0}
                value={loc.total_consultation_rooms ?? 0}
                onChange={(e) =>
                  setLoc({ total_consultation_rooms: Number(e.target.value) || 0 })
                }
                className="input"
              />
            </Field>
            <Field label="Camas (si aplica)">
              <input
                type="number"
                min={0}
                value={loc.total_beds ?? 0}
                onChange={(e) => setLoc({ total_beds: Number(e.target.value) || 0 })}
                className="input"
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <CheckboxField
              label="Urgencias"
              checked={!!loc.has_emergency}
              onChange={(v) => setLoc({ has_emergency: v })}
            />
            <CheckboxField
              label="Hospitalizacion"
              checked={!!loc.has_hospitalization}
              onChange={(v) => setLoc({ has_hospitalization: v })}
            />
            <CheckboxField
              label="Quirofano"
              checked={!!loc.has_surgery_rooms}
              onChange={(v) => setLoc({ has_surgery_rooms: v })}
            />
            <CheckboxField
              label="Laboratorio"
              checked={!!loc.has_lab}
              onChange={(v) => setLoc({ has_lab: v })}
            />
            <CheckboxField
              label="Imagenologia"
              checked={!!loc.has_imaging}
              onChange={(v) => setLoc({ has_imaging: v })}
            />
          </div>
        </div>
      </div>

      <WizardFooter onBack={onBack} onNext={onNext} disabled={!canProceed} submitting={submitting} />

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.5rem;
          font-size: 0.95rem;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: rgb(var(--brand-primary));
          box-shadow: 0 0 0 3px rgb(var(--brand-primary) / 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-slate-300 text-[rgb(var(--brand-primary))] focus:ring-[rgb(var(--brand-primary))]"
      />
      {label}
    </label>
  );
}
