'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Search, Loader2, UserCheck } from 'lucide-react';
import {
  updateTicketStatus, assignToMe,
  TICKET_STATUSES, TICKET_PRIORITIES,
  type TicketRow,
} from '@/lib/support/actions';

const STATUS_STYLES: Record<string, string> = {
  NUEVO:              'bg-blue-500/15 text-blue-200 border-blue-500/30',
  EN_PROGRESO:        'bg-amber-500/15 text-amber-200 border-amber-500/30',
  ESPERANDO_USUARIO:  'bg-purple-500/15 text-purple-200 border-purple-500/30',
  RESUELTO:           'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  CERRADO:            'bg-zinc-700 text-zinc-300 border-zinc-600',
};

const PRIORITY_STYLES: Record<string, string> = {
  urgente: 'bg-red-500/20 text-red-200',
  alta:    'bg-amber-500/20 text-amber-200',
  media:   'bg-zinc-700 text-zinc-200',
  baja:    'bg-zinc-800 text-zinc-400',
};

export function TicketsManager({
  tickets, filters,
}: {
  tickets: TicketRow[];
  filters: { status?: string; priority?: string; q?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ]             = useState(filters.q ?? '');
  const [status, setStatus]   = useState(filters.status ?? '');
  const [priority, setPriority] = useState(filters.priority ?? '');

  function applyFilters() {
    const params = new URLSearchParams();
    if (q)        params.set('q', q);
    if (status)   params.set('status', status);
    if (priority) params.set('priority', priority);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          type="search" placeholder="Asunto, email o nombre"
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
          <option value="">Todos los estados</option>
          {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
          <option value="">Todas las prioridades</option>
          {TICKET_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={applyFilters}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white transition">
          <Search className="h-4 w-4" /> Filtrar
        </button>
      </div>

      {tickets.length === 0 ? (
        <p className="text-sm text-zinc-500 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center">
          Sin tickets.
        </p>
      ) : (
        <ul className="space-y-2">
          {tickets.map((t) => <TicketItem key={t.id} t={t} />)}
        </ul>
      )}
    </div>
  );
}

function TicketItem({ t }: { t: TicketRow }) {
  const [isPending, startTransition] = useTransition();
  const statusStyle = STATUS_STYLES[t.status ?? 'NUEVO'] ?? STATUS_STYLES.NUEVO;
  const priorityStyle = PRIORITY_STYLES[t.priority ?? 'media'] ?? PRIORITY_STYLES.media;

  function onStatus(newStatus: string) {
    startTransition(async () => {
      const res = await updateTicketStatus(t.id, newStatus);
      if (!res.ok) toast.error(res.error);
      else toast.success(`Estado: ${newStatus}`);
    });
  }
  function onAssignToMe() {
    startTransition(async () => {
      const res = await assignToMe(t.id);
      if (!res.ok) toast.error(res.error);
      else toast.success('Asignado a vos');
    });
  }

  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${statusStyle}`}>
              {t.status ?? 'NUEVO'}
            </span>
            <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${priorityStyle}`}>
              {t.priority ?? 'media'}
            </span>
            {t.category && (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {t.category}
              </span>
            )}
            {t.assigned_to && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-200">
                <UserCheck className="h-3 w-3" /> asignado
              </span>
            )}
          </div>
          <p className="text-zinc-100 font-medium">{t.subject}</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t.name} · {t.email}{t.phone && ` · ${t.phone}`}
          </p>
          <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">{t.message}</p>
          <p className="text-xs text-zinc-500 mt-2">
            {t.created_at && new Date(t.created_at).toLocaleString('es-VE')}
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-1.5">
          <select
            value={t.status ?? 'NUEVO'} onChange={(e) => onStatus(e.target.value)}
            disabled={isPending}
            className="text-xs rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100"
          >
            {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {!t.assigned_to && (
            <button onClick={onAssignToMe} disabled={isPending}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-900 transition">
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}
              Tomar
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
