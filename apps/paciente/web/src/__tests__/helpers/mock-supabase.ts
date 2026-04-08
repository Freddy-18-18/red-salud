/**
 * Chainable mock for the Supabase client.
 *
 * Every Supabase query builder method returns `this`, so tests can configure
 * any chain like `.from().select().eq().order()` and set the final resolution
 * via `mockResolvedData()` / `mockResolvedError()`.
 *
 * Usage:
 *   const mock = createMockSupabase();
 *   mock.mockResolvedData([{ id: '1', name: 'Foo' }]);
 *
 *   vi.mock('@/lib/supabase/server', () => ({
 *     createClient: vi.fn(() => Promise.resolve(mock.client)),
 *   }));
 */

import { vi } from 'vitest';

export interface MockSupabaseClient {
  auth: {
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
}

export interface MockQueryBuilder {
  select: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  gt: ReturnType<typeof vi.fn>;
  lt: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  ilike: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: ReturnType<typeof vi.fn>;
}

export function createMockSupabase() {
  let resolvedValue: { data: unknown; error: unknown; count?: number | null } = {
    data: null,
    error: null,
    count: null,
  };

  const queryBuilder: MockQueryBuilder = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    gt: vi.fn(),
    lt: vi.fn(),
    in: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
  };

  // Every chainable method returns the queryBuilder itself.
  // The terminal await resolves with `resolvedValue`.
  const makeChainable = () => {
    const proxy = new Proxy(queryBuilder, {
      get(target, prop) {
        if (prop === 'then') {
          // Make the query builder thenable so `await query` works
          return (
            resolve: (v: typeof resolvedValue) => void,
            reject: (e: unknown) => void,
          ) => {
            try {
              resolve(resolvedValue);
            } catch (e) {
              reject(e);
            }
          };
        }
        const fn = target[prop as keyof MockQueryBuilder];
        if (typeof fn === 'function') {
          fn.mockReturnValue(proxy);
          return fn;
        }
        return fn;
      },
    });
    return proxy;
  };

  const chain = makeChainable();

  const client: MockSupabaseClient = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue(chain),
  };

  return {
    client,
    queryBuilder,

    /** Set the data that the next Supabase query chain will resolve with. */
    mockResolvedData(data: unknown, count: number | null = null) {
      resolvedValue = { data, error: null, count };
    },

    /** Set the error that the next Supabase query chain will resolve with. */
    mockResolvedError(error: { message: string; code?: string }) {
      resolvedValue = { data: null, error, count: null };
    },

    /** Mock auth to return an authenticated user. */
    mockAuthUser(user: { id: string; email?: string }) {
      client.auth.getUser.mockResolvedValue({
        data: { user },
        error: null,
      });
    },

    /** Mock auth to return an error (unauthenticated). */
    mockAuthError() {
      client.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });
    },

    /** Reset all mocks and resolved values. */
    reset() {
      resolvedValue = { data: null, error: null, count: null };
      client.auth.getUser.mockReset().mockResolvedValue({
        data: { user: null },
        error: null,
      });
      client.from.mockReset().mockReturnValue(chain);
      Object.values(queryBuilder).forEach((fn) => {
        if (typeof fn.mockClear === 'function') fn.mockClear();
      });
    },
  };
}
