'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle2, XCircle, Ban, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { AuditLogRow } from '@/lib/audit/query';

type Filters = { action?: string; status?: string; actor?: string };

export function AuditTable({
  rows, total, offset, filters,
}: {
  rows: AuditLogRow[];
  total: number;
  offset: number;
  filters: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [action, setAction] = useState(filters.action ?? '');
  const [actor, setActor]   = useState(filters.actor ?? '');
  const [status, setStatus] = useState(filters.status ?? '');

  function applyFilters() {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    if (actor)  params.set('actor', actor);
    if (status) params.set('status', status);
    router.push(`${pathname}?${params.toString()}`);
  }

  function paginate(delta: number) {
    const params = new URLSearchParams();
    if (filters.action) params.set('action', filters.action);
    if (filters.actor)  params.set('actor', filters.actor);
    if (filters.status) params.set('status', filters.status);
    const next = Math.max(0, offset + delta);
    if (next > 0) params.set('offset', String(next));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          type="text" placeholder="Acción (e.g. users.view)"
          value={action} onChange={(e) => setAction(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
        />
        <input
          type="text" placeholder="Email del actor"
          value={actor} onChange={(e) => setActor(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
        />
        <select
          value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600"
        >
          <option value="">Todos los estados</option>
          <option value="success">success</option>
          <option value="denied">denied</option>
          <option value="error">error</option>
        </select>
        <button
          onClick={applyFilters}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white transition"
        >
          <Search className="h-4 w-4" aria-hidden /> Filtrar
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 text-xs uppercase tracking-wide text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Cuándo</th>
              <th className="px-3 py-2 text-left font-medium">Actor</th>
              <th className="px-3 py-2 text-left font-medium">Acción</th>
              <th className="px-3 py-2 text-left font-medium">Recurso</th>
              <th className="px-3 py-2 text-left font-medium">Estado</th>
              <th className="px-3 py-2 text-left font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-zinc-500">Sin eventos</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-900/40 transition align-top">
                <td className="px-3 py-2 text-zinc-300 whitespace-nowrap text-xs font-mono">
                  {new Date(r.occurred_at).toLocaleString('es-VE')}
                </td>
                <td className="px-3 py-2">
                  <p className="text-zinc-100">{r.actor_email ?? '—'}</p>
                  {r.actor_role && (
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">{r.actor_role}</p>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-zinc-200">{r.action}</td>
                <td className="px-3 py-2 text-xs">
                  {r.resource_type && (
                    <p className="text-zinc-300">{r.resource_type}</p>
                  )}
                  {r.resource_id && (
                    <p className="font-mono text-zinc-500">{r.resource_id}</p>
                  )}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={r.status} message={r.error_message} />
                </td>
                <td className="px-3 py-2 font-mono text-xs text-zinc-500">{r.ip_address ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>{offset + 1}–{Math.min(offset + rows.length, total)} de {total}</span>
        <div className="flex gap-2">
          <button onClick={() => paginate(-100)} disabled={offset === 0}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-40 transition">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <button onClick={() => paginate(100)} disabled={offset + rows.length >= total}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-40 transition">
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, message }: { status: string; message: string | null }) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
        <CheckCircle2 className="h-3 w-3" aria-hidden /> success
      </span>
    );
  }
  if (status === 'denied') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-300" title={message ?? ''}>
        <Ban className="h-3 w-3" aria-hidden /> denied
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-300" title={message ?? ''}>
      <XCircle className="h-3 w-3" aria-hidden /> error
    </span>
  );
}
