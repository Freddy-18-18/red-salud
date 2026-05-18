'use client';

import { useState } from 'react';
import { useOrganizationContext } from '@/lib/providers/organization-provider';
import {
  useOrganizationModules,
  useSetModuleEnabled,
} from '@/lib/hooks/use-modules';
import { useUpdateOrganization } from '@/lib/hooks/use-organization';
import type { ModuleCategory, OrganizationModuleWithCatalog } from '@red-salud/types';

const TABS = ['general', 'branding', 'modulos', 'dominio'] as const;
type Tab = (typeof TABS)[number];

export default function SettingsPage() {
  const { organization, isAdmin } = useOrganizationContext();
  const [tab, setTab] = useState<Tab>('general');

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-slate-500 uppercase tracking-wide">Configuracion</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">{organization.name}</h1>
      </header>

      <nav className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
              tab === t
                ? 'border-[rgb(var(--brand-primary))] text-[rgb(var(--brand-primary))]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'general' && <GeneralTab readOnly={!isAdmin} />}
      {tab === 'branding' && <BrandingTab readOnly={!isAdmin} />}
      {tab === 'modulos' && <ModulesTab readOnly={!isAdmin} />}
      {tab === 'dominio' && <DomainTab readOnly={!isAdmin} />}
    </div>
  );
}

function GeneralTab({ readOnly }: { readOnly: boolean }) {
  const { organization } = useOrganizationContext();
  const update = useUpdateOrganization(organization.id);
  const [name, setName] = useState(organization.name);
  const [legalName, setLegalName] = useState(organization.legal_name ?? '');
  const [taxId, setTaxId] = useState(organization.tax_id ?? '');
  const [email, setEmail] = useState(organization.email ?? '');
  const [phone, setPhone] = useState(organization.phone ?? '');

  const handleSave = () =>
    update.mutate({
      name,
      legal_name: legalName || null,
      tax_id: taxId || null,
      email: email || null,
      phone: phone || null,
    });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-2xl">
      <Field label="Nombre comercial">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={readOnly}
          className="input"
        />
      </Field>
      <Field label="Razon social">
        <input
          type="text"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          disabled={readOnly}
          className="input"
        />
      </Field>
      <Field label="RIF / Tax ID">
        <input
          type="text"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          disabled={readOnly}
          className="input"
        />
      </Field>
      <Field label="Email institucional">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={readOnly}
          className="input"
        />
      </Field>
      <Field label="Telefono">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={readOnly}
          className="input"
        />
      </Field>

      {!readOnly && (
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 disabled:opacity-40"
          >
            {update.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.5rem;
          font-size: 0.9rem;
          outline: none;
          background: white;
        }
        .input:disabled {
          background: rgb(248 250 252);
        }
        .input:focus {
          border-color: rgb(var(--brand-primary));
          box-shadow: 0 0 0 3px rgb(var(--brand-primary) / 0.15);
        }
      `}</style>
    </div>
  );
}

function BrandingTab({ readOnly }: { readOnly: boolean }) {
  const { organization } = useOrganizationContext();
  const update = useUpdateOrganization(organization.id);
  const [primary, setPrimary] = useState(organization.branding.primary_color);
  const [accent, setAccent] = useState(organization.branding.accent_color);
  const [font, setFont] = useState(organization.branding.font_family);

  const handleSave = () =>
    update.mutate({
      branding: {
        ...organization.branding,
        primary_color: primary,
        accent_color: accent,
        font_family: font,
      },
    });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Color primario">
          <input
            type="color"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            disabled={readOnly}
            className="h-10 w-full rounded border border-slate-200 cursor-pointer"
          />
        </Field>
        <Field label="Color de acento">
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            disabled={readOnly}
            className="h-10 w-full rounded border border-slate-200 cursor-pointer"
          />
        </Field>
      </div>
      <Field label="Tipografia">
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          disabled={readOnly}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          {['Inter', 'Manrope', 'Plus Jakarta Sans', 'Poppins', 'Lato'].map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Field>

      {!readOnly && (
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={update.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 disabled:opacity-40"
          >
            {update.isPending ? 'Guardando...' : 'Aplicar branding'}
          </button>
        </div>
      )}
    </div>
  );
}

function ModulesTab({ readOnly }: { readOnly: boolean }) {
  const { organization } = useOrganizationContext();
  const { data: modules, isLoading } = useOrganizationModules(organization.id);
  const setEnabled = useSetModuleEnabled(organization.id);

  if (isLoading) return <p className="text-sm text-slate-500">Cargando...</p>;

  const grouped: Record<ModuleCategory, OrganizationModuleWithCatalog[]> = {
    core: [],
    operations: [],
    specialty: [],
    enterprise: [],
  };
  for (const m of modules ?? []) {
    grouped[m.catalog.category].push(m);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {(['core', 'operations', 'specialty', 'enterprise'] as ModuleCategory[]).map((cat) => (
        <section key={cat}>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
            {cat}
          </h3>
          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
            {grouped[cat].map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">{m.catalog.name}</h4>
                  {m.catalog.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{m.catalog.description}</p>
                  )}
                </div>
                <Toggle
                  enabled={m.is_enabled}
                  disabled={readOnly || m.catalog.is_core}
                  onChange={(enabled) =>
                    setEnabled.mutate({ key: m.module_key, enabled })
                  }
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function DomainTab({ readOnly }: { readOnly: boolean }) {
  const { organization } = useOrganizationContext();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-2xl">
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Subdominio actual</h3>
        <p className="text-sm text-slate-700 font-mono">{organization.slug}.redsalud.app</p>
      </div>
      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Dominio personalizado</h3>
        <p className="text-xs text-slate-500 mb-3">
          {organization.custom_domain
            ? `Configurado: ${organization.custom_domain}${organization.custom_domain_verified ? ' ✓' : ' (pendiente verificacion)'}`
            : 'Disponible en plan Professional. Apunta tu propio dominio (ej: panel.miclinica.com)'}
        </p>
        {!readOnly && (
          <button
            disabled
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 bg-slate-100 cursor-not-allowed"
            title="Disponible en breve"
          >
            Configurar dominio (proximamente)
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        enabled ? 'bg-[rgb(var(--brand-primary))]' : 'bg-slate-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
