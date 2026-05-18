'use client';

import { openDB, type IDBPDatabase } from 'idb';

/**
 * @file lib/offline/idb-store.ts
 * @description Thin singleton around the offline IndexedDB database.
 *
 * Schema (v1):
 *   - `kv`              — generic key/value store used by TanStack Query's
 *                         async-storage-persister. The persister writes one
 *                         blob per cache namespace.
 *   - `mutation-queue`  — Phase 3: pending mutations the doctor created
 *                         offline. Records are processed FIFO when the
 *                         browser comes back online.
 *
 * One DB, multiple stores. Keeps the storage budget under a single quota
 * grant and makes "clear everything offline" a one-liner.
 */

const DB_NAME = 'red-salud-medico-offline';
const DB_VERSION = 1;

export const STORES = {
  KV: 'kv',
  MUTATIONS: 'mutation-queue',
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not available in this runtime'));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.KV)) {
          db.createObjectStore(STORES.KV);
        }
        if (!db.objectStoreNames.contains(STORES.MUTATIONS)) {
          const store = db.createObjectStore(STORES.MUTATIONS, {
            keyPath: 'id',
          });
          // Index by createdAt so we can drain the queue FIFO without
          // sorting in JavaScript.
          store.createIndex('byCreatedAt', 'createdAt');
          store.createIndex('byStatus', 'status');
        }
      },
      blocked() {
        console.warn(
          '[idb] DB upgrade blocked by another tab. Close other tabs to upgrade.',
        );
      },
      terminated() {
        // Lost the connection (private mode, quota, browser crash). Drop the
        // promise so the next call retries from scratch.
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

// ---------------------------------------------------------------------------
// KV helpers — used by the TanStack Query persister.
// ---------------------------------------------------------------------------

export async function kvGet<T = unknown>(key: string): Promise<T | undefined> {
  try {
    const db = await getDb();
    return (await db.get(STORES.KV, key)) as T | undefined;
  } catch {
    return undefined;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORES.KV, value, key);
  } catch {
    // Storage quota or private mode — fail silently; the next online fetch
    // populates the in-memory cache anyway.
  }
}

export async function kvDelete(key: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORES.KV, key);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Mutation queue helpers — used by Phase 3.
// ---------------------------------------------------------------------------

export interface QueuedMutation {
  id: string;
  /** Logical name of the mutation (e.g. "createAppointment"). */
  kind: string;
  /** Arbitrary JSON payload the consumer needs to retry the call. */
  payload: unknown;
  /** Doctor id for scoping when the queue is shared across users on one device. */
  doctorId: string | null;
  createdAt: number;
  attempts: number;
  /** 'pending' | 'in_flight' | 'failed'. UI can colour the indicator. */
  status: 'pending' | 'in_flight' | 'failed';
  lastError?: string;
}

export async function queueAdd(mutation: QueuedMutation): Promise<void> {
  const db = await getDb();
  await db.put(STORES.MUTATIONS, mutation);
}

export async function queueAll(): Promise<QueuedMutation[]> {
  try {
    const db = await getDb();
    return ((await db.getAllFromIndex(STORES.MUTATIONS, 'byCreatedAt')) ??
      []) as QueuedMutation[];
  } catch {
    return [];
  }
}

export async function queueUpdate(mutation: QueuedMutation): Promise<void> {
  const db = await getDb();
  await db.put(STORES.MUTATIONS, mutation);
}

export async function queueRemove(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORES.MUTATIONS, id);
  } catch {
    /* ignore */
  }
}

export async function queueCount(): Promise<number> {
  try {
    const db = await getDb();
    return await db.count(STORES.MUTATIONS);
  } catch {
    return 0;
  }
}

/**
 * Wipe both stores. Exposed for the doctor settings "Limpiar caché" button
 * and the test cleanup paths.
 */
export async function wipeOfflineDb(): Promise<void> {
  try {
    const db = await getDb();
    await Promise.all([db.clear(STORES.KV), db.clear(STORES.MUTATIONS)]);
  } catch {
    /* ignore */
  }
}
