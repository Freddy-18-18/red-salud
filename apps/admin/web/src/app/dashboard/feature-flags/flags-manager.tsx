'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Flag, Plus, Loader2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { createFlag, toggleFlag, updateFlagRollout, type FlagRow } from '@/lib/feature-flags/actions';

const APPS = ['paciente', 'medico', 'farmacia', 'clinica', 'laboratorio', 'secretaria', 'seguro', 'ambulancia', 'academia'];
const ROLES = ['paciente', 'medico', 'farmacia', 'admin'];

export function FlagsManager({ flags, canToggle }: { flags: FlagRow[]; canToggle: boolean }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {canToggle && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white transition"
        >
          {showForm ? <><X className="h-4 w-4" /> Cancelar</> : <><Plus className="h-4 w-4" /> Nuevo flag</>}
        </button>
      )}

      {showForm && <CreateForm onDone={() => setShowForm(false)} />}

      {flags.length === 0 ? (
        <p className="text-sm text-zinc-500 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center">
          Sin flags todavía.
        </p>
      ) : (
        <ul className="space-y-2">
          {flags.map((f) => <FlagItem key={f.id} f={f} canToggle={canToggle} />)}
        </ul>
      )}
    </div>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [rollout, setRollout] = useState(0);
  const [apps, setApps] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function toggle(arr: string[], setArr: (v: string[]) => void, v: string) {
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[a-z][a-z0-9_.-]*$/.test(key)) {
      toast.error('Key debe ser lowercase, alfanumérico (puntos, guiones, underscores OK)');
      return;
    }
    startTransition(async () => {
      const res = await createFlag({
        key, description, enabled,
        rollout_percent: rollout,
        target_apps: apps,
        target_roles: roles,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('Flag creado');
      onDone();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" placeholder="key (ej: chat.video_calls)" required
          value={key} onChange={(e) => setKey(e.target.value.toLowerCase())}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 font-mono" />
        <input type="text" placeholder="descripción"
          value={description} onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Habilitar al crear
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-zinc-200 ml-auto">
          Rollout: <span className="font-mono w-10 text-right">{rollout}%</span>
          <input type="range" min={0} max={100} step={5} value={rollout}
            onChange={(e) => setRollout(Number(e.target.value))} className="w-32" />
        </label>
      </div>

      <div>
        <p className="text-xs text-zinc-400 mb-1.5">Apps destino (vacío = todas)</p>
        <div className="flex flex-wrap gap-1.5">
          {APPS.map((a) => (
            <button type="button" key={a} onClick={() => toggle(apps, setApps, a)}
              className={`text-xs px-2 py-1 rounded border transition ${
                apps.includes(a)
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}>{a}</button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-400 mb-1.5">Roles destino (vacío = todos)</p>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <button type="button" key={r} onClick={() => toggle(roles, setRoles, r)}
              className={`text-xs px-2 py-1 rounded border transition ${
                roles.includes(r)
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-100'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}>{r}</button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-emerald-600/30 border border-emerald-500/50 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/40 disabled:opacity-60 transition">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        <Flag className="h-4 w-4" /> Crear flag
      </button>
    </form>
  );
}

function FlagItem({ f, canToggle }: { f: FlagRow; canToggle: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [rolloutValue, setRolloutValue] = useState(f.rollout_percent);

  function onToggle() {
    startTransition(async () => {
      const res = await toggleFlag(f.id, !f.enabled);
      if (!res.ok) toast.error(res.error);
    });
  }
  function onRolloutCommit() {
    if (rolloutValue === f.rollout_percent) return;
    startTransition(async () => {
      const res = await updateFlagRollout(f.id, rolloutValue);
      if (!res.ok) {
        toast.error(res.error);
        setRolloutValue(f.rollout_percent);
      } else {
        toast.success(`Rollout ${rolloutValue}%`);
      }
    });
  }

  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Flag className={`h-4 w-4 ${f.enabled ? 'text-emerald-300' : 'text-zinc-500'}`} aria-hidden />
            <p className="font-mono text-sm text-zinc-100">{f.key}</p>
            {f.enabled ? (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">ON</span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">OFF</span>
            )}
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700">{f.rollout_percent}%</span>
          </div>
          {f.description && <p className="text-sm text-zinc-300 mt-1">{f.description}</p>}
          <p className="text-xs text-zinc-500 mt-1">
            Apps: {f.target_apps.length === 0 ? 'todas' : f.target_apps.join(', ')} ·
            Roles: {f.target_roles.length === 0 ? 'todos' : f.target_roles.join(', ')}
          </p>
        </div>
        {canToggle && (
          <button onClick={onToggle} disabled={isPending}
            className="shrink-0 inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-900 transition">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> :
              f.enabled ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
            {f.enabled ? 'Apagar' : 'Encender'}
          </button>
        )}
      </div>

      {canToggle && (
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-16">Rollout:</span>
          <input type="range" min={0} max={100} step={5}
            value={rolloutValue} onChange={(e) => setRolloutValue(Number(e.target.value))}
            onMouseUp={onRolloutCommit} onTouchEnd={onRolloutCommit}
            className="flex-1" />
          <span className="font-mono w-10 text-right">{rolloutValue}%</span>
        </div>
      )}
    </li>
  );
}
