'use client';

import { useState } from 'react';
import { ROLE_LABELS, type InviteMemberInput, type OrganizationRole } from '@red-salud/types';

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

interface Props {
  onClose: () => void;
  onSubmit: (input: Omit<InviteMemberInput, 'organization_id'>) => Promise<void>;
}

export function InviteDialog({ onClose, onSubmit }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationRole>('doctor');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ email: email.trim(), role, message: message.trim() || undefined });
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? 'No se pudo enviar la invitacion');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Invitar miembro</h2>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">Rol</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrganizationRole)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              {INVITABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-700 mb-1">
              Mensaje (opcional)
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
            />
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? 'Enviando...' : 'Enviar invitacion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
