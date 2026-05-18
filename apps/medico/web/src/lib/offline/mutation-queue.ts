'use client';

import { supabase } from '@/lib/supabase/client';

import {
  queueAdd,
  queueAll,
  queueRemove,
  queueUpdate,
  type QueuedMutation,
} from './idb-store';

/**
 * @file lib/offline/mutation-queue.ts
 * @description Offline-safe write queue.
 *
 * When the doctor saves a cita / consulta / receta without internet, the
 * mutation lands here first. Each queued item describes WHICH Supabase call
 * to retry and with which payload. When the browser regains connectivity
 * (or the doctor manually triggers a flush), we drain the queue in order.
 *
 * Design notes:
 *   1. **Logical mutation kinds** — not raw HTTP requests. We could persist
 *      `fetch(url, init)` blobs, but Supabase JS request bodies aren't
 *      replay-safe (signed URLs, tokens). Storing `{ kind, payload }` lets
 *      the executor re-issue the call with a FRESH session + service client.
 *   2. **FIFO ordering** — items are sorted by `createdAt`. Cita created
 *      at 09:01 syncs before cita at 09:05. Avoids weird interleavings.
 *   3. **Per-item retry** — each entry tracks `attempts` + `lastError`.
 *      A failed item stays in the queue with `status: 'failed'` so the UI
 *      can flag it for manual resolution.
 *   4. **No automatic conflict resolution yet** — last-write-wins implicit
 *      because we replay in order. If two doctors edit the same row
 *      concurrently, the second flush overwrites the first. Phase 2 of
 *      offline can add CRDTs / merge logic if real conflicts surface.
 *
 * Producers should NEVER call `supabase.from(...)` directly from a flow
 * the doctor might trigger offline. Wrap it in a registered executor here.
 */

// ---------------------------------------------------------------------------
// Executors — one function per mutation kind
// ---------------------------------------------------------------------------

/**
 * An executor knows how to perform one logical mutation against Supabase.
 * Receives the payload the doctor saved offline. Should throw on failure
 * so the queue marks the item as `failed` and retries on the next flush.
 */
type Executor = (payload: unknown) => Promise<void>;

const executors: Record<string, Executor> = {};

export function registerMutationExecutor(kind: string, executor: Executor): void {
  executors[kind] = executor;
}

// ---------------------------------------------------------------------------
// Enqueue
// ---------------------------------------------------------------------------

function makeId(): string {
  // crypto.randomUUID exists in every modern browser + Node 19+.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface EnqueueArgs {
  kind: string;
  payload: unknown;
  doctorId?: string | null;
}

/**
 * Push a mutation onto the queue. Returns the queued id so the caller can
 * surface optimistic UI ("Pendiente · {id}") and reconcile later.
 */
export async function enqueueMutation({
  kind,
  payload,
  doctorId = null,
}: EnqueueArgs): Promise<string> {
  const mutation: QueuedMutation = {
    id: makeId(),
    kind,
    payload,
    doctorId,
    createdAt: Date.now(),
    attempts: 0,
    status: 'pending',
  };
  await queueAdd(mutation);
  return mutation.id;
}

// ---------------------------------------------------------------------------
// Flush
// ---------------------------------------------------------------------------

interface FlushResult {
  processed: number;
  failed: number;
  remaining: number;
}

/**
 * Drain the queue in FIFO order until either:
 *   - every item succeeds
 *   - we lose connectivity again (any executor throws and `navigator.onLine`
 *     is false — we stop early to avoid burning attempts)
 *   - an executor throws and we've reached the attempt cap
 *
 * Returns counts for the caller to surface via a toast.
 */
const MAX_ATTEMPTS = 5;

let flushInFlight: Promise<FlushResult> | null = null;

export async function flushMutationQueue(): Promise<FlushResult> {
  if (flushInFlight) return flushInFlight;

  flushInFlight = (async (): Promise<FlushResult> => {
    let processed = 0;
    let failed = 0;
    const items = await queueAll();

    for (const item of items) {
      if (!navigator.onLine) break;

      const executor = executors[item.kind];
      if (!executor) {
        // Unknown kind — drop with a warning. This usually means a producer
        // was renamed; replaying a stale payload would do more harm than good.
        await queueUpdate({
          ...item,
          status: 'failed',
          lastError: `Unknown executor: ${item.kind}`,
        });
        failed += 1;
        continue;
      }

      const updated: QueuedMutation = {
        ...item,
        status: 'in_flight',
        attempts: item.attempts + 1,
      };
      await queueUpdate(updated);

      try {
        await executor(item.payload);
        await queueRemove(item.id);
        processed += 1;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'sync_error';
        const exhausted = updated.attempts >= MAX_ATTEMPTS;
        await queueUpdate({
          ...updated,
          status: exhausted ? 'failed' : 'pending',
          lastError: message,
        });
        if (exhausted) failed += 1;
      }
    }

    const remaining = (await queueAll()).filter(
      (item) => item.status !== 'failed',
    ).length;
    return { processed, failed, remaining };
  })().finally(() => {
    flushInFlight = null;
  });

  return flushInFlight;
}

// ---------------------------------------------------------------------------
// Auto-flush on reconnect
// ---------------------------------------------------------------------------

let reconnectHandlerInstalled = false;

/**
 * Install browser event listeners that automatically trigger a flush when
 * the doctor's machine comes back online. Idempotent — multiple calls just
 * no-op after the first.
 */
export function installReconnectFlush(): void {
  if (typeof window === 'undefined') return;
  if (reconnectHandlerInstalled) return;
  reconnectHandlerInstalled = true;

  function tryFlush() {
    if (!navigator.onLine) return;
    void flushMutationQueue();
  }

  window.addEventListener('online', tryFlush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') tryFlush();
  });

  // Best-effort attempt on initial load — if items were left from a
  // previous session, drain them as soon as we know we're online.
  tryFlush();
}

// ---------------------------------------------------------------------------
// Read APIs for the UI
// ---------------------------------------------------------------------------

/**
 * Snapshot of every pending/failed item — used by the offline banner and
 * the "Pendientes" badge to surface how many writes haven't synced yet.
 */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  return queueAll();
}

// ---------------------------------------------------------------------------
// Built-in executors
// ---------------------------------------------------------------------------

// Appointments
registerMutationExecutor('createAppointment', async (payload) => {
  const { error } = await supabase
    .from('appointments')
    .insert(payload as Record<string, unknown>);
  if (error) throw error;
});

registerMutationExecutor('updateAppointmentStatus', async (payload) => {
  const p = payload as { id: string; status: string };
  const { error } = await supabase
    .from('appointments')
    .update({ status: p.status })
    .eq('id', p.id);
  if (error) throw error;
});

// Prescriptions
registerMutationExecutor('createPrescription', async (payload) => {
  const { error } = await supabase
    .from('prescriptions')
    .insert(payload as Record<string, unknown>);
  if (error) throw error;
});

// Notifications mark-read
registerMutationExecutor('markNotificationRead', async (payload) => {
  const p = payload as { id: string };
  const { error } = await supabase
    .from('doctor_notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', p.id);
  if (error) throw error;
});
