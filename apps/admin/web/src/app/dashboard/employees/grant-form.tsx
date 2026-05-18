'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { findUserByEmail, grantAdminRole } from '@/lib/employees/actions';
import { ADMIN_ROLE_LABELS, type AdminRoleType } from '@/lib/rbac/types';

const ROLES: AdminRoleType[] = ['super_admin', 'support', 'finance', 'ops', 'read_only'];

export function GrantForm() {
  const [email, setEmail] = useState('');
  const [foundUser, setFoundUser] = useState<{ id: string; email: string; full_name: string | null } | null>(null);
  const [role, setRole] = useState<AdminRoleType>('support');
  const [notes, setNotes] = useState('');
  const [isFinding, startFinding] = useTransition();
  const [isGranting, startGranting] = useTransition();

  function onFind(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startFinding(async () => {
      try {
        const u = await findUserByEmail(email);
        if (!u) {
          toast.error('No encontré a ese usuario en profiles. Tiene que registrarse primero.');
          setFoundUser(null);
          return;
        }
        setFoundUser(u);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'error');
      }
    });
  }

  function onGrant() {
    if (!foundUser) return;
    startGranting(async () => {
      const res = await grantAdminRole(foundUser.id, role, notes);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Otorgué ${role} a ${foundUser.email}`);
      setEmail(''); setFoundUser(null); setNotes(''); setRole('support');
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-sm font-medium text-zinc-300 mb-3 inline-flex items-center gap-2">
        <UserPlus className="h-4 w-4" /> Otorgar rol a empleado
      </h2>

      <form onSubmit={onFind} className="flex gap-2">
        <input
          type="email"
          placeholder="email@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
        />
        <button
          type="submit" disabled={isFinding}
          className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-white disabled:opacity-60 transition"
        >
          {isFinding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar
        </button>
      </form>

      {foundUser && (
        <div className="mt-4 rounded-md border border-zinc-700 bg-zinc-950/60 p-3 space-y-3">
          <div>
            <p className="text-sm text-zinc-100 font-medium">{foundUser.full_name ?? foundUser.email}</p>
            <p className="text-xs text-zinc-500 font-mono">{foundUser.email}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={role} onChange={(e) => setRole(e.target.value as AdminRoleType)}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ADMIN_ROLE_LABELS[r]}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Notas (motivo)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            />
          </div>
          <button
            onClick={onGrant} disabled={isGranting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600/30 border border-emerald-500/50 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/40 disabled:opacity-60 transition"
          >
            {isGranting && <Loader2 className="h-4 w-4 animate-spin" />}
            Otorgar {ADMIN_ROLE_LABELS[role]}
          </button>
        </div>
      )}
    </section>
  );
}
