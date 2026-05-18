import { vi, describe, it, expect, beforeEach } from 'vitest';

import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

const mock = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

import { POST, DELETE } from './route';

// ---------------------------------------------------------------------------
// Chain helpers — the route does:
//   1) from('appointments').select.eq.is.single  → ownership/status check
//   2) from('patient_appointment_waitlist').select.eq.eq.eq.maybeSingle  → existing row
//   3) from('patient_appointment_waitlist').{insert|update}.select.single
// DELETE is simpler: just from('patient_appointment_waitlist').delete.eq.eq
// ---------------------------------------------------------------------------

interface ChainOptions {
  appointment: Record<string, unknown> | null;
  appointmentError?: { code?: string };
  existingWaitlistRow?: Record<string, unknown> | null;
  insertedRow?: Record<string, unknown>;
  updatedRow?: Record<string, unknown>;
  insertError?: { message: string } | null;
  updateError?: { message: string } | null;
  deleteError?: { message: string } | null;
}

function setupChain(opts: ChainOptions) {
  const aptChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.appointmentError
        ? { data: null, error: opts.appointmentError }
        : { data: opts.appointment, error: null },
    ),
  };

  const waitlistSelectChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: opts.existingWaitlistRow ?? null,
      error: null,
    }),
  };

  const waitlistInsertChain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: opts.insertedRow ?? { id: 'wl-new', status: 'active' },
      error: opts.insertError ?? null,
    }),
  };

  const waitlistUpdateChain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: opts.updatedRow ?? { id: 'wl-existing', status: 'active' },
      error: opts.updateError ?? null,
    }),
  };

  // Delete chain — `.delete().eq().eq()` resolves at the second eq.
  // Both eq() calls return an object that is itself thenable so the route's
  // `await supabase.from(...).delete().eq().eq()` pattern works.
  const deleteResult = { data: null, error: opts.deleteError ?? null };
  const deleteEqInner = {
    eq: vi.fn().mockResolvedValue(deleteResult),
    then: (
      resolve: (v: typeof deleteResult) => void,
      reject: (e: unknown) => void,
    ) => {
      try {
        resolve(deleteResult);
      } catch (e) {
        reject(e);
      }
    },
  };
  const deleteEqOuter = {
    eq: vi.fn().mockReturnValue(deleteEqInner),
  };
  const waitlistDeleteChain = {
    delete: vi.fn().mockReturnValue(deleteEqOuter),
  };

  // The route calls `from('patient_appointment_waitlist')` multiple times in
  // the POST flow (once for select, once for insert/update). DELETE only
  // calls it once. Use a counter to hand back the right chain shape.
  let waitlistCallIdx = 0;

  mock.client.from.mockImplementation((table: string) => {
    if (table === 'appointments') return aptChain as never;
    if (table === 'patient_appointment_waitlist') {
      waitlistCallIdx += 1;
      // Need the right chain for the call site:
      //   POST 1st call: select → returns waitlistSelectChain
      //   POST 2nd call: insert OR update
      //   DELETE 1st call: delete
      if (waitlistCallIdx === 1) {
        // Both POST and DELETE call `from(...)` once first. Expose the
        // entry points each path uses (.select for POST, .delete for DELETE)
        // on a unified chain so the route's first call lands correctly.
        return {
          select: waitlistSelectChain.select,
          eq: waitlistSelectChain.eq,
          maybeSingle: waitlistSelectChain.maybeSingle,
          delete: waitlistDeleteChain.delete,
        } as never;
      }
      // The 2nd POST call is either insert or update — both shapes share the
      // chain we synthesized.
      return opts.existingWaitlistRow
        ? (waitlistUpdateChain as never)
        : (waitlistInsertChain as never);
    }
    throw new Error(`Unexpected table: ${table}`);
  });
}

async function callPost(id: string) {
  const request = createRequest(`/api/appointments/${id}/waitlist`, {
    method: 'POST',
    body: {},
  });
  return POST(request, { params: Promise.resolve({ id }) });
}

async function callDelete(id: string) {
  const request = createRequest(`/api/appointments/${id}/waitlist`, {
    method: 'DELETE',
  });
  return DELETE(request, { params: Promise.resolve({ id }) });
}

const baseAppointment = {
  id: 'apt-1',
  doctor_id: 'doc-1',
  patient_id: 'user-1',
  scheduled_at: '2099-12-31T10:00:00Z',
  status: 'confirmed',
};

// ---------------------------------------------------------------------------
// POST — opt-in
// ---------------------------------------------------------------------------

describe('POST /api/appointments/[id]/waitlist', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callPost('apt-1');
    expect(response.status).toBe(401);
  });

  it('returns 404 when appointment does not exist', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: null,
      appointmentError: { code: 'PGRST116' },
    });
    const response = await callPost('apt-missing');
    expect(response.status).toBe(404);
  });

  it('returns 404 when wrong patient (no leak)', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: { ...baseAppointment, patient_id: 'someone-else' },
    });
    const response = await callPost('apt-1');
    expect(response.status).toBe(404);
  });

  it('returns 400 when appointment is cancelled', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: { ...baseAppointment, status: 'cancelled' },
    });
    const response = await callPost('apt-1');
    const { status, body } = await parseResponse<{ error: string }>(response);
    expect(status).toBe(400);
    expect(body.error).toMatch(/cancelada|completada/i);
  });

  it('inserts a new waitlist row when none exists', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      existingWaitlistRow: null,
      insertedRow: {
        id: 'wl-new',
        status: 'active',
        before_at: baseAppointment.scheduled_at,
      },
    });
    const response = await callPost('apt-1');
    const { status, body } = await parseResponse<{
      data: { id: string; status: string };
    }>(response);
    expect(status).toBe(201);
    expect(body.data.status).toBe('active');
  });

  it('reactivates an existing row instead of inserting a duplicate', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      existingWaitlistRow: { id: 'wl-existing', status: 'cancelled' },
      updatedRow: { id: 'wl-existing', status: 'active' },
    });
    const response = await callPost('apt-1');
    const { status, body } = await parseResponse<{
      data: { id: string; status: string };
    }>(response);
    expect(status).toBe(201);
    expect(body.data.id).toBe('wl-existing');
    expect(body.data.status).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// DELETE — opt-out
// ---------------------------------------------------------------------------

describe('DELETE /api/appointments/[id]/waitlist', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callDelete('apt-1');
    expect(response.status).toBe(401);
  });

  it('returns 200 with null data on successful opt-out', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      deleteError: null,
    });
    const response = await callDelete('apt-1');
    const { status, body } = await parseResponse<{ data: null }>(response);
    expect(status).toBe(200);
    expect(body.data).toBeNull();
  });

  it('returns 500 when delete fails', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      deleteError: { message: 'DB exploded' },
    });
    const response = await callDelete('apt-1');
    expect(response.status).toBe(500);
  });
});
