/**
 * @file __tests__/mutation-queue.test.ts
 * @description Unit tests for the offline mutation queue executor + FIFO
 * draining behaviour. Mocks `idb-store` entirely so the test never touches
 * a real IndexedDB and can mutate the in-memory queue freely.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// ── Mocks ───────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })),
  },
}));

interface FakeQueuedMutation {
  id: string;
  kind: string;
  payload: unknown;
  doctorId: string | null;
  createdAt: number;
  attempts: number;
  status: 'pending' | 'in_flight' | 'failed';
  lastError?: string;
}

const memoryQueue: FakeQueuedMutation[] = [];

vi.mock('../idb-store', () => ({
  queueAdd: vi.fn(async (mutation: FakeQueuedMutation) => {
    memoryQueue.push({ ...mutation });
  }),
  queueAll: vi.fn(async () =>
    [...memoryQueue].sort((a, b) => a.createdAt - b.createdAt),
  ),
  queueUpdate: vi.fn(async (mutation: FakeQueuedMutation) => {
    const idx = memoryQueue.findIndex((m) => m.id === mutation.id);
    if (idx >= 0) memoryQueue[idx] = { ...mutation };
  }),
  queueRemove: vi.fn(async (id: string) => {
    const idx = memoryQueue.findIndex((m) => m.id === id);
    if (idx >= 0) memoryQueue.splice(idx, 1);
  }),
  queueCount: vi.fn(async () => memoryQueue.length),
  STORES: { KV: 'kv', MUTATIONS: 'mutation-queue' },
}));

beforeEach(() => {
  memoryQueue.length = 0;
  // Force `navigator.onLine = true` so the flush loop runs every iteration.
  Object.defineProperty(globalThis.navigator ?? {}, 'onLine', {
    value: true,
    configurable: true,
    writable: true,
  });
});

// ── Tests ───────────────────────────────────────────────────────────────

describe('mutation-queue', () => {
  it('enqueues a mutation and returns its id', async () => {
    const { enqueueMutation } = await import('../mutation-queue');
    const id = await enqueueMutation({
      kind: 'createAppointment',
      payload: { doctor_id: 'doc-1' },
      doctorId: 'doc-1',
    });
    expect(typeof id).toBe('string');
    expect(memoryQueue).toHaveLength(1);
    expect(memoryQueue[0].kind).toBe('createAppointment');
    expect(memoryQueue[0].status).toBe('pending');
  });

  it('runs registered executors in FIFO order during flush', async () => {
    const { enqueueMutation, flushMutationQueue, registerMutationExecutor } =
      await import('../mutation-queue');

    const ran: string[] = [];
    registerMutationExecutor('demo-a', async (payload) => {
      ran.push(`a-${(payload as { tag: string }).tag}`);
    });
    registerMutationExecutor('demo-b', async (payload) => {
      ran.push(`b-${(payload as { tag: string }).tag}`);
    });

    await enqueueMutation({ kind: 'demo-a', payload: { tag: '1' } });
    await enqueueMutation({ kind: 'demo-b', payload: { tag: '2' } });
    await enqueueMutation({ kind: 'demo-a', payload: { tag: '3' } });

    const result = await flushMutationQueue();
    expect(result.processed).toBe(3);
    expect(result.failed).toBe(0);
    expect(ran).toEqual(['a-1', 'b-2', 'a-3']);
    expect(memoryQueue).toHaveLength(0);
  });

  it('marks an executor failure and keeps the entry for retry', async () => {
    const { enqueueMutation, flushMutationQueue, registerMutationExecutor } =
      await import('../mutation-queue');

    let attempts = 0;
    registerMutationExecutor('demo-flaky', async () => {
      attempts += 1;
      throw new Error('boom');
    });

    await enqueueMutation({ kind: 'demo-flaky', payload: {} });
    const first = await flushMutationQueue();
    expect(first.processed).toBe(0);
    expect(memoryQueue).toHaveLength(1);
    expect(memoryQueue[0].status).toBe('pending');
    expect(memoryQueue[0].lastError).toBe('boom');
    expect(attempts).toBe(1);
  });

  it('drops items whose kind has no registered executor', async () => {
    const { enqueueMutation, flushMutationQueue } = await import(
      '../mutation-queue'
    );
    await enqueueMutation({ kind: 'demo-unknown-kind', payload: {} });
    const result = await flushMutationQueue();
    expect(result.failed).toBeGreaterThanOrEqual(1);
    expect(memoryQueue[0].status).toBe('failed');
    expect(memoryQueue[0].lastError).toContain('Unknown executor');
  });

  it('deduplicates concurrent flush calls (executor runs once)', async () => {
    const { enqueueMutation, flushMutationQueue, registerMutationExecutor } =
      await import('../mutation-queue');

    let runs = 0;
    registerMutationExecutor('demo-once', async () => {
      runs += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    await enqueueMutation({ kind: 'demo-once', payload: {} });
    // Two concurrent flush calls — the executor should only fire ONCE
    // because the second call rides the in-flight promise.
    await Promise.all([flushMutationQueue(), flushMutationQueue()]);
    expect(runs).toBe(1);
    expect(memoryQueue).toHaveLength(0);
  });
});
