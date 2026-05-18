'use client';

import { useState } from 'react';
import type { CreateOrganizationLocationInput } from '@red-salud/types';

interface Props {
  onClose: () => void;
  onSubmit: (input: Omit<CreateOrganizationLocationInput, 'organization_id'>) => Promise<void>;
}

export function LocationFormDialog({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        address_line: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        phone: phone.trim() || undefined,
      });
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? 'Error al guardar');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Nueva sede</h2>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <Field label="Nombre" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              autoFocus
            />
          </Field>
          <Field label="Direccion">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ciudad">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Estado">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Telefono">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[rgb(var(--brand-primary))] hover:opacity-90 disabled:opacity-40 transition"
            >
              {submitting ? 'Guardando...' : 'Crear sede'}
            </button>
          </div>
        </form>

        <style jsx>{`
          .input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid rgb(226 232 240);
            border-radius: 0.5rem;
            font-size: 0.9rem;
            outline: none;
          }
          .input:focus {
            border-color: rgb(var(--brand-primary));
            box-shadow: 0 0 0 3px rgb(var(--brand-primary) / 0.15);
          }
        `}</style>
      </div>
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
      <span className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
    </label>
  );
}
