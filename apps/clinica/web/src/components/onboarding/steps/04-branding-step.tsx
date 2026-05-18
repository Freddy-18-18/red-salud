'use client';

import { useEffect } from 'react';
import { applyBranding } from '@/lib/theming/apply-branding';
import type { WizardData } from '../onboarding-wizard';
import { WizardFooter } from './wizard-footer';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}

const COLOR_PRESETS = [
  { name: 'Azul Salud', primary: '#0066FF', accent: '#10B981' },
  { name: 'Verde Medico', primary: '#10B981', accent: '#0066FF' },
  { name: 'Vino', primary: '#9F1239', accent: '#F59E0B' },
  { name: 'Marino', primary: '#1E3A8A', accent: '#0EA5E9' },
  { name: 'Esmeralda', primary: '#059669', accent: '#0EA5E9' },
  { name: 'Indigo', primary: '#4F46E5', accent: '#EC4899' },
  { name: 'Coral', primary: '#EA580C', accent: '#0EA5E9' },
  { name: 'Grafito', primary: '#1F2937', accent: '#10B981' },
];

const FONT_OPTIONS = ['Inter', 'Manrope', 'Plus Jakarta Sans', 'Poppins', 'Lato'];

export function BrandingStep({ data, onChange, onBack, onNext, submitting }: Props) {
  const branding = data.branding;
  const setBranding = (patch: Partial<typeof branding>) =>
    onChange({ branding: { ...branding, ...patch } });

  useEffect(() => {
    applyBranding(branding);
  }, [branding]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Personaliza tu experiencia</h2>
      <p className="text-slate-600 mb-8">
        Esto define como se ve tu panel y como se llaman las cosas. Los preview se actualizan en
        vivo mientras editas.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Paleta de colores</h3>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const active = branding.primary_color.toUpperCase() === preset.primary.toUpperCase();
                return (
                  <button
                    key={preset.name}
                    onClick={() =>
                      setBranding({ primary_color: preset.primary, accent_color: preset.accent })
                    }
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                      active
                        ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary)/0.05)]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex">
                      <div
                        className="w-6 h-6 rounded-l"
                        style={{ background: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-r"
                        style={{ background: preset.accent }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{preset.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <ColorInput
                label="Primario"
                value={branding.primary_color}
                onChange={(v) => setBranding({ primary_color: v })}
              />
              <ColorInput
                label="Acento"
                value={branding.accent_color}
                onChange={(v) => setBranding({ accent_color: v })}
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Tipografia</h3>
            <div className="flex flex-wrap gap-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setBranding({ font_family: f })}
                  className={`px-3 py-1.5 rounded-md text-sm border transition ${
                    branding.font_family === f
                      ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary)/0.1)] text-[rgb(var(--brand-primary))]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Densidad visual</h3>
            <div className="flex gap-2">
              {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setBranding({ ui_density: d })}
                  className={`flex-1 px-3 py-2 rounded-md text-sm border capitalize transition ${
                    branding.ui_density === d
                      ? 'border-[rgb(var(--brand-primary))] bg-[rgb(var(--brand-primary)/0.1)] text-[rgb(var(--brand-primary))]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {d === 'compact' ? 'Compacta' : d === 'comfortable' ? 'Comoda' : 'Espaciosa'}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Terminologia</h3>
            <p className="text-xs text-slate-500 mb-3">
              Como llamas a tus pacientes y citas. Esto se refleja en TODA la app.
            </p>
            <div className="space-y-3">
              <TermInput
                label="Paciente"
                value={branding.terminology.patient}
                onChange={(v) =>
                  setBranding({ terminology: { ...branding.terminology, patient: v } })
                }
              />
              <TermInput
                label="Cita"
                value={branding.terminology.appointment}
                onChange={(v) =>
                  setBranding({ terminology: { ...branding.terminology, appointment: v } })
                }
              />
              <TermInput
                label="Consulta"
                value={branding.terminology.consultation}
                onChange={(v) =>
                  setBranding({ terminology: { ...branding.terminology, consultation: v } })
                }
              />
            </div>
          </section>
        </div>

        <BrandingPreview data={data} />
      </div>

      <WizardFooter onBack={onBack} onNext={onNext} submitting={submitting} />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 rounded border border-slate-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm font-mono uppercase"
        />
      </div>
    </label>
  );
}

function TermInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-xs text-slate-600">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-sm"
      />
    </div>
  );
}

function BrandingPreview({ data }: { data: WizardData }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white sticky top-32">
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-slate-500 font-mono">
          {data.slug || 'tuclinica'}.redsalud.app
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ background: data.branding.primary_color }}
          >
            {data.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{data.name || 'Tu Clinica'}</h3>
            <p className="text-xs text-slate-500">{data.template?.name}</p>
          </div>
        </div>

        <div className="space-y-2">
          <PreviewRow label="Inicio" active />
          <PreviewRow label={cap(data.branding.terminology.appointment) + 's'} />
          <PreviewRow label={cap(data.branding.terminology.patient) + 's'} />
        </div>

        <div className="mt-5 p-4 rounded-lg bg-slate-50">
          <p className="text-xs text-slate-500 mb-2">
            Hoy llegaron 12 {data.branding.terminology.patient}s
          </p>
          <button
            className="px-4 py-2 rounded text-sm font-medium text-white"
            style={{ background: data.branding.primary_color }}
          >
            Nueva {data.branding.terminology.appointment}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`px-3 py-2 rounded text-sm ${
        active
          ? 'bg-[rgb(var(--brand-primary)/0.1)] text-[rgb(var(--brand-primary))] font-medium'
          : 'text-slate-600'
      }`}
    >
      {label}
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
