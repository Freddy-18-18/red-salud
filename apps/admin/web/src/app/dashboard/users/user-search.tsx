'use client';

import { useState, useTransition, useDeferredValue, useEffect } from 'react';
import Link from 'next/link';
import { Search, Loader2, ShieldCheck, ShieldAlert, CircleSlash } from 'lucide-react';
import { searchUsers, type UserSearchResult } from '@/lib/users/search';

export function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const deferred = useDeferredValue(query);

  useEffect(() => {
    if (deferred.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    startTransition(async () => {
      try {
        setError(null);
        const data = await searchUsers(deferred);
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error de búsqueda');
        setResults([]);
      }
    });
  }, [deferred]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" aria-hidden />
        <input
          type="search"
          autoFocus
          placeholder="Email, nombre, teléfono, cédula, RIF o ID UUID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-zinc-800 bg-zinc-900 pl-10 pr-10 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" aria-hidden />
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && deferred.trim().length >= 2 && results.length === 0 && !isPending && (
        <p className="text-sm text-zinc-500">Sin resultados.</p>
      )}

      {results.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/60 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Usuario</th>
                <th className="px-3 py-2 text-left font-medium">Rol</th>
                <th className="px-3 py-2 text-left font-medium">Cédula / RIF</th>
                <th className="px-3 py-2 text-left font-medium">Teléfono</th>
                <th className="px-3 py-2 text-left font-medium">Estado</th>
                <th className="px-3 py-2 text-left font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {results.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/40 transition">
                  <td className="px-3 py-2.5">
                    <Link href={`/dashboard/users/${u.id}`} className="block">
                      <p className="font-medium text-zinc-100">{u.full_name ?? '—'}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-300">
                    <span className="inline-block rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-300 font-mono text-xs">
                    {u.national_id ?? '—'}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-300">{u.phone ?? '—'}</td>
                  <td className="px-3 py-2.5">
                    <UserStatus user={u} />
                  </td>
                  <td className="px-3 py-2.5 text-zinc-400 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('es-VE') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UserStatus({ user }: { user: UserSearchResult }) {
  if (user.deleted_at) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-300">
        <CircleSlash className="h-3 w-3" aria-hidden /> Eliminado
      </span>
    );
  }
  if (user.role === 'medico' && !user.sacs_verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-300">
        <ShieldAlert className="h-3 w-3" aria-hidden /> SACS pend.
      </span>
    );
  }
  if (user.national_id_verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
        <ShieldCheck className="h-3 w-3" aria-hidden /> Verificado
      </span>
    );
  }
  return <span className="text-xs text-zinc-500">Sin verificar</span>;
}
