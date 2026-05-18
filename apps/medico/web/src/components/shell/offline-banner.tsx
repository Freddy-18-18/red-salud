'use client';

import { useEffect, useState } from 'react';
import { CloudOff, Loader2, RotateCw, Wifi } from 'lucide-react';

import { useConnectionStatus } from '@/hooks/use-connection-status';
import {
  flushMutationQueue,
  installReconnectFlush,
} from '@/lib/offline/mutation-queue';
import { usePendingMutationsCount } from '@/lib/offline/use-offline-mutation';

/**
 * @file offline-banner.tsx
 * @description Persistent banner that appears when the doctor is working
 * without internet OR when there are queued mutations waiting to sync.
 *
 * Three visible states:
 *   1. Online + zero queue           → nothing renders (the banner is silent)
 *   2. Online + queue > 0            → "Sincronizando N pendiente(s)…" with
 *                                      a spinner; auto-flushes on mount.
 *   3. Offline                       → amber banner "Sin conexión — los
 *                                      cambios se guardarán al volver."
 *
 * Sits flush-top below the GlobalHeader so it never overlaps the action
 * cluster. On mobile it sticks above the bottom nav.
 */

export function OfflineBanner(): React.ReactElement | null {
  const status = useConnectionStatus();
  const pendingCount = usePendingMutationsCount();
  const [isSyncing, setIsSyncing] = useState(false);

  // Make sure the auto-flush listener is alive even on routes that never
  // call `useOfflineMutation` directly.
  useEffect(() => {
    installReconnectFlush();
  }, []);

  // When we transition online with a non-zero queue, kick off a flush and
  // surface a spinner while it runs. The mutation-queue helper already
  // guards against concurrent flushes.
  useEffect(() => {
    if (status === 'offline') return;
    if (pendingCount === 0) return;
    let cancelled = false;
    setIsSyncing(true);
    flushMutationQueue().finally(() => {
      if (!cancelled) setIsSyncing(false);
    });
    return () => {
      cancelled = true;
    };
  }, [status, pendingCount]);

  // Hidden state — nothing to say.
  if (status === 'online' && pendingCount === 0) return null;

  const isOffline = status === 'offline';
  const isReconnecting = status === 'reconnecting';

  if (isOffline) {
    return (
      <div
        role="status"
        data-testid="offline-banner"
        className="sticky top-14 z-30 flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-600 backdrop-blur dark:text-amber-300"
      >
        <span className="flex items-center gap-2">
          <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium">Sin conexión</span>
          <span className="text-amber-600/80 dark:text-amber-300/80">
            — Los cambios se guardan localmente y se sincronizan al volver el
            internet.
          </span>
        </span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 font-medium">
            {pendingCount} pendiente{pendingCount === 1 ? '' : 's'}
          </span>
        )}
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div
        role="status"
        data-testid="offline-banner"
        className="sticky top-14 z-30 flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-600 backdrop-blur dark:text-amber-300"
      >
        <Loader2
          className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span className="font-medium">Reconectando…</span>
        <span className="text-amber-600/80 dark:text-amber-300/80">
          Verificando si el servidor responde.
        </span>
      </div>
    );
  }

  // Online + queue → syncing state
  return (
    <div
      role="status"
      data-testid="offline-banner"
      className="sticky top-14 z-30 flex items-center justify-between gap-3 border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-600 backdrop-blur dark:text-emerald-300"
    >
      <span className="flex items-center gap-2">
        {isSyncing ? (
          <Loader2
            className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        <span className="font-medium">
          {isSyncing
            ? `Sincronizando ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}…`
            : `${pendingCount} cambio${pendingCount === 1 ? '' : 's'} pendiente${pendingCount === 1 ? '' : 's'} de sincronizar`}
        </span>
      </span>
      {!isSyncing && (
        <button
          type="button"
          onClick={() => {
            setIsSyncing(true);
            void flushMutationQueue().finally(() => setIsSyncing(false));
          }}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 font-medium transition-colors hover:bg-emerald-500/30"
        >
          <RotateCw className="h-3 w-3" aria-hidden="true" />
          Sincronizar ahora
        </button>
      )}
    </div>
  );
}
