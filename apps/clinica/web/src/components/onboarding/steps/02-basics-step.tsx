'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ClinicProfileTemplate } from '@red-salud/types';
import { isValidSlug, slugify } from '@/lib/utils/slug';
import { isSlugAvailable } from '@/lib/db/organizations';
import type { WizardData } from '../onboarding-wizard';
import { WizardFooter } from './wizard-footer';

interface Props {
  data: WizardData;
  template: ClinicProfileTemplate;
  onChange: (patch: Partial<WizardData>) => void;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}

export function BasicsStep({ data, template, onChange, onBack, onNext, submitting }: Props) {
  const [slugTouched, setSlugTouched] = useState(!!data.slug);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!data.name || slugTouched) return;
    onChange({ slug: slugify(data.name) });
  }, [data.name, slugTouched, onChange]);

  useEffect(() => {
    if (!data.slug || !isValidSlug(data.slug)) {
      setSlugAvailable(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    const t = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(data.slug);
        if (!cancelled) setSlugAvailable(available);
      } catch {
        if (!cancelled) setSlugAvailable(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [data.slug]);

  const slugValid = useMemo(() => isValidSlug(data.slug), [data.slug]);
  const canProceed =
    data.name.trim().length >= 3 && slugValid && slugAvailable === true && !submitting;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Datos de la organizacion</h2>
      <p className="text-slate-600 mb-8">
        Plantilla seleccionada: <strong>{template.name}</strong>
      </p>

      <div className="space-y-5 max-w-2xl">
        <Field label="Nombre comercial" required>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Clinica Ejemplo"
            className="input"
          />
        </Field>

        <Field
          label="Identificador (subdominio)"
          required
          hint={
            data.slug
              ? `Tu panel: ${data.slug}.redsalud.app`
              : 'Solo letras minusculas, numeros y guiones'
          }
        >
          <input
            type="text"
            value={data.slug}
            onChange={(e) => {
              setSlugTouched(true);
              onChange({ slug: slugify(e.target.value) });
            }}
            placeholder="clinica-ejemplo"
            className="input"
          />
          {data.slug && (
            <p className="mt-1 text-xs">
              {checking && <span className="text-slate-500">Verificando...</span>}
              {!checking && !slugValid && (
                <span className="text-red-600">Formato invalido (3-63 caracteres, sin espacios)</span>
              )}
              {!checking && slugValid && slugAvailable === false && (
                <span className="text-red-600">Ya esta tomado, probá otro</span>
              )}
              {!checking && slugValid && slugAvailable === true && (
                <span className="text-emerald-600">Disponible</span>
              )}
            </p>
          )}
        </Field>

        {(template.organization_type === 'specialty_clinic' ||
          template.organization_type === 'medical_center') && (
          <Field label="Especialidad principal" hint="Ej: Odontologia, Oftalmologia">
            <input
              type="text"
              value={data.primary_specialty}
              onChange={(e) => onChange({ primary_specialty: e.target.value })}
              placeholder="Odontologia"
              className="input"
            />
          </Field>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Razon social">
            <input
              type="text"
              value={data.legal_name}
              onChange={(e) => onChange({ legal_name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="RIF / Tax ID">
            <input
              type="text"
              value={data.tax_id}
              onChange={(e) => onChange({ tax_id: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Email institucional">
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Telefono principal">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="input"
            />
          </Field>
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
          transition: border-color 0.15s;
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
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
