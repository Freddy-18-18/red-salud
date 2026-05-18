'use client';

import { ROLE_LABELS, type OrganizationRole } from '@red-salud/types';
import type { WizardData } from '../onboarding-wizard';
import { WizardFooter } from './wizard-footer';

interface Props {
  data: WizardData;
  onChange: (patch: Partial<WizardData>) => void;
  onBack: () => void;
  onNext: () => void;
  submitting: boolean;
}

const INVITABLE_ROLES: OrganizationRole[] = [
  'admin',
  'medical_lead',
  'doctor',
  'secretary',
  'nurse',
  'finance',
  'operations',
  'inventory',
  'viewer',
];

export function TeamStep({ data, onChange, onBack, onNext, submitting }: Props) {
  const invites = data.invites;

  const setInvite = (idx: number, patch: Partial<(typeof invites)[number]>) => {
    const next = invites.map((inv, i) => (i === idx ? { ...inv, ...patch } : inv));
    onChange({ invites: next });
  };

  const addInvite = () => {
    onChange({ invites: [...invites, { email: '', role: 'doctor' }] });
  };

  const removeInvite = (idx: number) => {
    onChange({ invites: invites.filter((_, i) => i !== idx) });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Invita a tu equipo</h2>
      <p className="text-slate-600 mb-8">
        Agrega medicos, secretarias o administradores. Les enviaremos un link de invitacion. Podes
        saltarte este paso y hacerlo despues.
      </p>

      <div className="space-y-3">
        {invites.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Aun no agregaste a nadie. Si trabajas solo o queres invitar despues, podes continuar.
          </div>
        )}

        {invites.map((inv, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white"
          >
            <input
              type="email"
              value={inv.email}
              onChange={(e) => setInvite(idx, { email: e.target.value })}
              placeholder="email@ejemplo.com"
              className="flex-1 px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand-primary)/0.3)]"
            />
            <select
              value={inv.role}
              onChange={(e) => setInvite(idx, { role: e.target.value as OrganizationRole })}
              className="px-3 py-2 border border-slate-200 rounded text-sm bg-white"
            >
              {INVITABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeInvite(idx)}
              className="px-3 py-2 text-slate-400 hover:text-red-600 transition"
              aria-label="Eliminar"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={addInvite}
          className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-[rgb(var(--brand-primary))] hover:text-[rgb(var(--brand-primary))] transition"
        >
          + Agregar invitacion
        </button>
      </div>

      <WizardFooter
        onBack={onBack}
        onNext={onNext}
        submitting={submitting}
        nextLabel={invites.length === 0 ? 'Saltar' : `Enviar ${invites.length} invitacion${invites.length === 1 ? '' : 'es'}`}
      />
    </div>
  );
}
