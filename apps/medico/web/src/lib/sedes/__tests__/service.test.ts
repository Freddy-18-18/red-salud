/**
 * @file lib/sedes/__tests__/service.test.ts
 * @description Behavior tests for `deleteSede`'s appointments guard (R6).
 *
 * The service throws `Error('SEDE_HAS_APPOINTMENTS:<n>')` whenever the
 * appointments-count probe returns a positive number. When the FK column is
 * absent (Postgres 42703 = undefined_column), the guard treats the count as
 * zero and the delete proceeds — Phase 3 ships before the FK exists.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Shared scriptable stub for the supabase client
// ---------------------------------------------------------------------------

interface DeleteStub {
  appointmentsCount: number | null;
  appointmentsError: { code: string; message: string } | null;
  deleteError: { code: string; message: string } | null;
}

const stub: DeleteStub = {
  appointmentsCount: 0,
  appointmentsError: null,
  deleteError: null,
};

vi.mock('@/lib/supabase/client', () => {
  const supabase = {
    from: (table: string) => {
      if (table === 'appointments') {
        return {
          select: (_columns: string, _opts: { count?: string; head?: boolean }) => ({
            eq: (_col: string, _val: string) =>
              Promise.resolve({
                count: stub.appointmentsCount,
                error: stub.appointmentsError,
              }),
          }),
        };
      }

      if (table === 'doctor_practice_locations') {
        return {
          delete: () => ({
            eq: (_col: string, _val: string) =>
              Promise.resolve({ error: stub.deleteError }),
          }),
        };
      }

      throw new Error(`Unexpected table in test: ${table}`);
    },
  };
  return { supabase };
});

// Import AFTER the mock has been registered.
import { deleteSede } from '../service';

describe('deleteSede — appointments guard (R6)', () => {
  beforeEach(() => {
    stub.appointmentsCount = 0;
    stub.appointmentsError = null;
    stub.deleteError = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws SEDE_HAS_APPOINTMENTS:N when the sede has linked appointments', async () => {
    stub.appointmentsCount = 5;

    await expect(deleteSede('sede-id')).rejects.toThrow(
      /^SEDE_HAS_APPOINTMENTS:5$/,
    );
  });

  it('deletes when the FK column is absent (PG 42703 = undefined_column)', async () => {
    stub.appointmentsCount = null;
    stub.appointmentsError = {
      code: '42703',
      message: 'column appointments.practice_location_id does not exist',
    };

    await expect(deleteSede('sede-id')).resolves.toBeUndefined();
  });

  it('deletes when the count is zero', async () => {
    stub.appointmentsCount = 0;

    await expect(deleteSede('sede-id')).resolves.toBeUndefined();
  });

  it('propagates non-42703 errors from the count probe', async () => {
    stub.appointmentsCount = null;
    stub.appointmentsError = {
      code: '40000',
      message: 'database is on fire',
    };

    await expect(deleteSede('sede-id')).rejects.toMatchObject({
      code: '40000',
    });
  });

  it('surfaces delete errors', async () => {
    stub.appointmentsCount = 0;
    stub.deleteError = { code: '23503', message: 'fk violation' };

    await expect(deleteSede('sede-id')).rejects.toMatchObject({
      code: '23503',
    });
  });
});
