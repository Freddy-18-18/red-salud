'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Megaphone, Plus, Loader2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import {
  createAnnouncement, toggleAnnouncement,
  ANNOUNCEMENT_TYPES, APP_TARGETS, PRIORITIES,
  type AnnouncementRow,
} from '@/lib/announcements/actions';

const TYPE_STYLES: Record<string, string> = {
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  maintenance: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
};

export function AnnouncementsManager({
  announcements, canPublish,
}: {
  announcements: AnnouncementRow[];
  canPublish: boolean;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {canPublish && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white transition"
        >
          {showForm ? <><X className="h-4 w-4" /> Cancelar</> : <><Plus className="h-4 w-4" /> Nuevo anuncio</>}
        </button>
      )}

      {showForm && <CreateForm onDone={() => setShowForm(false)} />}

      {announcements.length === 0 ? (
        <p className="text-sm text-zinc-500 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center">
          Sin anuncios.
        </p>
      ) : (
        <ul className="space-y-2">
          {announcements.map((a) => (
            <AnnouncementItem key={a.id} a={a} canPublish={canPublish} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('info');
  const [targetApp, setTargetApp] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Título y contenido son requeridos');
      return;
    }
    startTransition(async () => {
      const res = await createAnnouncement({
        title, content, type, target_app: targetApp, priority,
        is_active: true,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        starts_at: null,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('Anuncio publicado');
      onDone();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
      <input
        type="text" placeholder="Título" required
        value={title} onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
      />
      <textarea
        placeholder="Contenido del anuncio" required rows={3}
        value={content} onChange={(e) => setContent(e.target.value)}
        className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
          {ANNOUNCEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={targetApp} onChange={(e) => setTargetApp(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
          {APP_TARGETS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          type="datetime-local" placeholder="Expira"
          value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        />
      </div>
      <button type="submit" disabled={isPending}
        className="inline-flex items-center gap-2 rounded-md bg-emerald-600/30 border border-emerald-500/50 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/40 disabled:opacity-60 transition">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        <Megaphone className="h-4 w-4" /> Publicar
      </button>
    </form>
  );
}

function AnnouncementItem({ a, canPublish }: { a: AnnouncementRow; canPublish: boolean }) {
  const [isPending, startTransition] = useTransition();
  const typeStyle = TYPE_STYLES[a.type ?? 'info'] ?? TYPE_STYLES.info;

  function onToggle() {
    startTransition(async () => {
      const res = await toggleAnnouncement(a.id, !a.is_active);
      if (!res.ok) toast.error(res.error);
      else toast.success(a.is_active ? 'Desactivado' : 'Activado');
    });
  }

  return (
    <li className={`rounded-lg border p-4 ${typeStyle}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-zinc-100">{a.title}</p>
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-900/50">{a.target_app ?? 'all'}</span>
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-900/50">{a.type ?? 'info'}</span>
            {a.is_active ? (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200">Activo</span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">Inactivo</span>
            )}
          </div>
          <p className="text-sm text-zinc-200 mt-1.5 whitespace-pre-wrap">{a.content}</p>
          <p className="text-xs text-zinc-400 mt-2">
            Creado {a.created_at ? new Date(a.created_at).toLocaleString('es-VE') : '—'}
            {a.expires_at && <span> · Expira {new Date(a.expires_at).toLocaleDateString('es-VE')}</span>}
          </p>
        </div>
        {canPublish && (
          <button onClick={onToggle} disabled={isPending}
            className="shrink-0 inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900/50 px-2.5 py-1 text-xs text-zinc-200 hover:bg-zinc-900 transition">
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> :
              a.is_active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
            {a.is_active ? 'Desactivar' : 'Activar'}
          </button>
        )}
      </div>
    </li>
  );
}
