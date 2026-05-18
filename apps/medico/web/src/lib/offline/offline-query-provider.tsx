'use client';

import { useState, type ReactNode } from 'react';
import {
  QueryClient,
  type Query,
} from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

import { kvDelete, kvGet, kvSet } from './idb-store';

/**
 * @file offline-query-provider.tsx
 * @description Wraps the medico app in a TanStack Query client whose state
 * is persisted to IndexedDB. The persisted blob is what makes "cargá la app
 * sin internet y todavía ves los pacientes que ya viste" work.
 *
 * Persister flow:
 *   1. On mount, the persister reads the blob from IndexedDB and rehydrates
 *      the in-memory query cache. Stale-but-present queries are usable
 *      immediately.
 *   2. As queries refetch in the background (when online), TanStack Query
 *      writes the updated cache back to IndexedDB.
 *   3. If the doctor closes the tab and reopens it offline, step 1 fires
 *      again and the cache is ready before any network call.
 *
 * Cache shape:
 *   - `staleTime: 5 min`         — reduces refetch noise; the doctor's
 *                                  agenda doesn't need second-precision.
 *   - `gcTime: 24h`              — keep entries around long enough for a
 *                                  day-without-internet scenario.
 *   - `refetchOnWindowFocus`     — false; doctors keep tabs in the
 *                                  background for hours, refocus shouldn't
 *                                  trigger a refetch storm.
 *   - `networkMode: 'offlineFirst'` — queries return cached data even
 *                                     while offline instead of throwing.
 *
 * We filter what gets persisted so we don't accidentally store mutation
 * state or queries that aren't safe to read while offline (auth checks).
 */

interface OfflineQueryProviderProps {
  children: ReactNode;
}

const FIVE_MINUTES = 5 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const PERSISTER_KEY = 'tanstack-query-cache';

/**
 * Decide whether a given query's data should be persisted. Anything that
 * smells like auth or session is excluded — those should re-validate against
 * the network on every open.
 */
function shouldPersistQuery(query: Query): boolean {
  const head = String(query.queryKey?.[0] ?? '');
  if (!head) return false;
  if (head.startsWith('auth')) return false;
  if (head.startsWith('session')) return false;
  return true;
}

export function OfflineQueryProvider({ children }: OfflineQueryProviderProps): React.ReactElement {
  // Lazily build the client + persister once per mount. Re-renders never
  // rebuild them.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: FIVE_MINUTES,
            gcTime: TWENTY_FOUR_HOURS,
            refetchOnWindowFocus: false,
            // 'offlineFirst' = cache wins while offline; 'online' = throw.
            // We want the doctor to keep seeing what they already loaded.
            networkMode: 'offlineFirst',
            retry: (failureCount, error) => {
              // Don't hammer a 4xx that's the doctor's fault — only retry
              // transient errors. TanStack Query passes the error through
              // unchanged from the queryFn so we duck-type the shape.
              const status = (error as { status?: number })?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
          },
          mutations: {
            networkMode: 'offlineFirst',
          },
        },
      }),
  );

  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: {
        getItem: kvGet,
        setItem: async (key, value) => {
          await kvSet(key, value);
        },
        removeItem: kvDelete,
      },
      key: PERSISTER_KEY,
      // Throttle writes so a noisy cache (a chatty page) doesn't hammer
      // IndexedDB. Persist at most every 1s.
      throttleTime: 1000,
    }),
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: TWENTY_FOUR_HOURS,
        // Bump this string to invalidate everyone's persisted cache after
        // a breaking change to a queryKey or response shape.
        buster: 'v1',
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
