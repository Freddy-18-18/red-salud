'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  enqueueMutation,
  flushMutationQueue,
  getPendingMutations,
  installReconnectFlush,
} from './mutation-queue';

/**
 * @file use-offline-mutation.ts
 * @description React glue for the mutation queue.
 *
 * Two surfaces:
 *   1. `useOfflineMutation()` — returns a function the caller invokes to
 *      perform a mutation. Decides on the fly whether to fire it directly
 *      (online + executor available) or to enqueue (offline) and surfaces
 *      the right toast for either branch.
 *
 *   2. `usePendingMutationsCount()` — small subscription that re-polls the
 *      IDB queue on online/offline events + visibility changes so the UI
 *      banner shows an accurate "N pendientes" badge without us forcing
 *      every consumer to subscribe to the same channel.
 */

export interface OfflineMutationOptions {
  /** Logical mutation kind — must match a registered executor. */
  kind: string;
  /** Payload the executor needs at retry time. */
  payload: unknown;
  /** Optional human label for the success/queue toast. */
  label?: string;
  /** Doctor id to scope the entry — used by the future per-doctor flush. */
  doctorId?: string | null;
}

interface OfflineMutationResult {
  /** True when the mutation was enqueued offline; false when fired live. */
  queued: boolean;
}

export function useOfflineMutation() {
  // Install the auto-reconnect listener exactly once per app lifecycle.
  useEffect(() => {
    installReconnectFlush();
  }, []);

  return useCallback(async function run(
    options: OfflineMutationOptions,
  ): Promise<OfflineMutationResult> {
    const isOnline = typeof navigator === 'undefined' || navigator.onLine;
    if (!isOnline) {
      await enqueueMutation({
        kind: options.kind,
        payload: options.payload,
        doctorId: options.doctorId ?? null,
      });
      toast.info(
        options.label
          ? `${options.label} guardado localmente`
          : 'Guardado localmente — se sincronizará al volver la conexión',
        { description: 'Se sincronizará al volver la conexión.' },
      );
      return { queued: true };
    }

    // Online path. We still go through the queue executor so we use the
    // SAME code path that runs after a reconnect. That guarantees the
    // mutation is exercised exactly once in production semantics.
    try {
      // Enqueue + immediately flush. flushMutationQueue is idempotent and
      // de-duplicates concurrent calls via its in-flight promise.
      await enqueueMutation({
        kind: options.kind,
        payload: options.payload,
        doctorId: options.doctorId ?? null,
      });
      const result = await flushMutationQueue();
      if (result.failed > 0) {
        // The flush surfaced its own toast already; treat this as queued
        // so the caller can fall back to the offline UX.
        return { queued: true };
      }
      return { queued: false };
    } catch (err) {
      // Network blip mid-flush — leave the entry in queue, surface
      // the offline message so the doctor knows their work is safe.
      toast.warning('Trabajando sin conexión', {
        description: 'Reintentaremos en cuanto vuelva el internet.',
      });
      return { queued: true };
    }
  }, []);
}

// ---------------------------------------------------------------------------
// Pending count subscription
// ---------------------------------------------------------------------------

export function usePendingMutationsCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const all = await getPendingMutations();
      if (cancelled) return;
      // Only show items that are pending or failed (in_flight is transient
      // and would flicker the badge).
      setCount(all.filter((m) => m.status !== 'in_flight').length);
    }

    void refresh();

    // Refresh on connectivity changes + visibility — same triggers we use
    // for the auto-flush, so the badge stays in sync with reality.
    function onChange() {
      void refresh();
    }
    window.addEventListener('online', onChange);
    window.addEventListener('offline', onChange);
    document.addEventListener('visibilitychange', onChange);

    // Light polling fallback (every 5s) so the count drains as items finish
    // syncing in the background. Cheap because the IDB read is O(N) on a
    // small N.
    const interval = window.setInterval(() => void refresh(), 5_000);

    return () => {
      cancelled = true;
      window.removeEventListener('online', onChange);
      window.removeEventListener('offline', onChange);
      document.removeEventListener('visibilitychange', onChange);
      window.clearInterval(interval);
    };
  }, []);

  return count;
}
