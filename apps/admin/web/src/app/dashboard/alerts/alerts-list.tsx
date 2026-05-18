'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, Loader2, X } from 'lucide-react';
import { resolveAlert, type AlertRow } from '@/lib/alerts/actions';

const SEVERITY_STYLE: Record<AlertRow['severity'], { icon: typeof Info; color: string; bg: string }> = {
  low:      { icon: Info,           color: 'text-blue-300',     bg: 'bg-blue-500/10  border-blue-500/30' },
  medium:   { icon: AlertTriangle,  color: 'text-amber-300',    bg: 'bg-amber-500/10 border-amber-500/30' },
  high:     { icon: AlertOctagon,   color: 'text-red-300',      bg: 'bg-red-500/10   border-red-500/30' },
  critical: { icon: AlertOctagon,   color: 'text-red-200',      bg: 'bg-red-600/20   border-red-500/50' },
};

export function AlertsList({
  title, alerts, resolvable,
}: {
  title: string;
  alerts: AlertRow[];
  resolvable?: boolean;
}) {
  return (
    <section>
      <h2 className="text-sm font-medium text-zinc-300 mb-3">{title}</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-zinc-500 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          Sin alertas.
        </p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <AlertItem key={a.id} alert={a} resolvable={resolvable} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AlertItem({ alert, resolvable }: { alert: AlertRow; resolvable?: boolean }) {
  const style = SEVERITY_STYLE[alert.severity];
  const Icon = style.icon;
  const [showResolve, setShowResolve] = useState(false);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  function onResolve() {
    startTransition(async () => {
      const res = await resolveAlert(alert.id, notes);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('Alerta resuelta');
      setShowResolve(false);
      setNotes('');
    });
  }

  return (
    <li className={`rounded-lg border p-4 ${style.bg}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${style.color}`} aria-hidden />
          <div className="min-w-0">
            <p className="text-sm text-zinc-100">{alert.message}</p>
            <p className="text-xs text-zinc-400 mt-1">
              <span className="font-mono">{alert.rule_name}</span>
              <span className="mx-2">·</span>
              <span>{new Date(alert.created_at).toLocaleString('es-VE')}</span>
              <span className="mx-2">·</span>
              <span className="uppercase tracking-wide">{alert.severity}</span>
            </p>
            {alert.resolved_at && (
              <p className="text-xs text-emerald-300 mt-1 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Resuelta {new Date(alert.resolved_at).toLocaleString('es-VE')}
                {alert.resolution_notes && ` — ${alert.resolution_notes}`}
              </p>
            )}
          </div>
        </div>
        {resolvable && !alert.resolved_at && (
          <button
            onClick={() => setShowResolve(!showResolve)}
            className="shrink-0 inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-900 transition"
          >
            {showResolve ? (<><X className="h-3 w-3" /> Cancelar</>) : 'Resolver'}
          </button>
        )}
      </div>
      {showResolve && resolvable && !alert.resolved_at && (
        <div className="mt-3 space-y-2">
          <textarea
            placeholder="Notas de resolución (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />
          <button
            onClick={onResolve}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600/30 border border-emerald-500/50 px-3 py-1.5 text-sm text-emerald-100 hover:bg-emerald-600/40 disabled:opacity-60 transition"
          >
            {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            <CheckCircle2 className="h-3 w-3" /> Confirmar resolución
          </button>
        </div>
      )}
    </li>
  );
}
